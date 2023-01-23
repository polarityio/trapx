"use strict";

const request = require("postman-request");
const config = require("./config/config");
const async = require("async");
const fs = require("fs");
const moment = require("moment");
const fp = require('lodash/fp');

let Logger;
let requestWithDefaults;

const MAX_PARALLEL_LOOKUPS = 10;

/**
 *
 * @param entities
 * @param options
 * @param cb
 */
function startup(logger) {
  let defaults = {};
  Logger = logger;

  const { cert, key, passphrase, ca, proxy, rejectUnauthorized } = config.request;

  if (typeof cert === "string" && cert.length > 0) {
    defaults.cert = fs.readFileSync(cert);
  }

  if (typeof key === "string" && key.length > 0) {
    defaults.key = fs.readFileSync(key);
  }

  if (typeof passphrase === "string" && passphrase.length > 0) {
    defaults.passphrase = passphrase;
  }

  if (typeof ca === "string" && ca.length > 0) {
    defaults.ca = fs.readFileSync(ca);
  }

  if (typeof proxy === "string" && proxy.length > 0) {
    defaults.proxy = proxy;
  }

  if (typeof rejectUnauthorized === "boolean") {
    defaults.rejectUnauthorized = rejectUnauthorized;
  }

  requestWithDefaults = request.defaults(defaults);
}

function doLookup(entities, { url, ...optionsWithoutUrl }, cb) {
  let lookupResults = [];
  let tasks = [];
  const options = {
    ...optionsWithoutUrl,
    url: url && url.endsWith("/") ? url.substring(0, url.length - 1) : url
  };

  Logger.debug(entities);

  entities.forEach((entity) => {
    let requestOptions = {
      method: 'POST',
      uri: `${options.url}/api/v1.3/events/search`,
      json: true
    };

    if (entity.isDomain) {
      requestOptions.body = {
        api_key: options.apiKey,
        filter: {
          trap_type: options.trapType.value,
          attacker_hostname: fp.flow(
            fp.get('value'),
            fp.split('.'),
            (x) => fp.slice(x.length - 2, x.length, x),
            fp.join('.')
          )(entity)
        }
      };
    } else if (entity.isIPv4) {
      requestOptions.body = {
        api_key: options.apiKey,
        filter: { trap_type: options.trapType.value, attacker_address: entity.value }
      };
    } else {
      return;
    }

    Logger.trace({ uri: requestOptions }, "Request URI");

    tasks.push(function(done) {
      requestWithDefaults(requestOptions, function(error, res, body) {
        if (error) {
          return done(error);
        }

        Logger.trace(requestOptions);
        Logger.trace(
          { body, statusCode: res ? res.statusCode : "N/A" },
          "Result of Lookup"
        );

        let result = {};

        if (res.statusCode === 200) {
          result = {
            entity,
            body
          };
        } else if ([202, 404].includes(res.statusCode)) {
          result = {
            entity,
            body: null
          };
        } else {
          let error = {
            err: body,
            detail: `${body.error}: ${body.message}`
          };
          if (res.statusCode === 401) {
            error = {
              err: "Unauthorized",
              detail:
                "Request had Authorization header but token was missing or invalid. Please ensure your API key is valid."
            };
          } else if (res.statusCode === 403) {
            error = {
              err: "Access Denied",
              detail: "Not enough access permissions."
            };
          } else if (res.statusCode === 429) {
            error = {
              err: "Too Many Requests",
              detail:
                "Daily number of requests exceeds limit. Check Retry-After header to get information about request delay."
            };
          } else if (Math.round(res.statusCode / 10) * 10 === 500) {
            error = {
              err: "Server Error",
              detail: "Unexpected Server Error"
            };
          }

          return done(error);
        }

        done(null, result);
      });
    });
  });

  async.parallelLimit(tasks, MAX_PARALLEL_LOOKUPS, (err, results) => {
    if (err) {
      Logger.error({ err: err }, "Error");
      cb(err);
      return;
    }

    results.forEach((result) => {
      if (result.body === null || result.body.number_of_events === 0) {
        lookupResults.push({
          entity: result.entity,
          data: null
        });
      } else {
        const eventsFromTheLastWeek = fp.filter(
          (event) => moment(event.event_timestamp).diff(moment().subtract(1, 'week'), 'days') >= 0,
          fp.get('body.events', result)
        );
        lookupResults.push({
          entity: result.entity,
          data: {
            summary: [],
            details: {
              ...result.body,
              highestSeverityOfTheWeek:
                eventsFromTheLastWeek.length &&
                fp.flow(
                  fp.sortBy(({ severity }) => (severity === 'low' ? -1 : severity === 'high' ? 1 : 0)),
                  fp.first,
                  fp.get('severity')
                )(eventsFromTheLastWeek),
              binaryFilesAvailable: fp.some(fp.get('x_trapx_com_binary'), fp.get('body.events', result)),
              pcapFilesAvailable: fp.some(fp.get('x_trapx_com_pcap'), fp.get('body.events', result)),
              events: fp.flow(
                fp.get('body.events'),
                fp.map((event) => {
                  const eventId = fp.replace(/MWT0*/gi, '', event.x_trapx_com_eventid);
                  return {
                    ...event,
                    jsonDownloadLink: `${options.url}/download_mwtrap_json_file?id=${eventId}`,
                    pcapDownloadLink:
                      event.x_trapx_com_pcap && `${options.url}/download_mwtrap_pcap_file?id=${eventId}`,
                    binaryDownloadLink:
                      event.x_trapx_com_binary && `${options.url}/download_mwtrap_binary_files?id=${eventId}`
                  };
                })
              )(result)
            }
          }
        });
      }
    });

    Logger.debug({ lookupResults }, "Results");
    cb(null, lookupResults);
  });
}

function validateUrl(errors, url) {
  if (url && url.endsWith("//")) {
    errors.push({
      key: "url",
      message: "Your URL must not end with a //"
    });
  }
}

function validateStringOption(errors, options, optionName, errMessage) {
  if (
    typeof options[optionName].value !== "string" ||
    (typeof options[optionName].value === "string" &&
      options[optionName].value.length === 0)
  ) {
    errors.push({
      key: optionName,
      message: errMessage
    });
  }
}

function validateOptions(options, callback) {
  let errors = [];

  validateUrl(errors, options.url.value);
  validateStringOption(errors, options, "url", "You must provide a valid URL");
  validateStringOption(errors, options, "apiKey", "You must provide a valid API Key");

  callback(null, errors);
}

module.exports = {
  doLookup,
  startup,
  validateOptions
};
