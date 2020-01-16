module.exports = {
  /**
   * Name of the integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @required
   */
  name: 'TrapX DeceptionGrid',
  /**
   * The acronym that appears in the notification window when information from this integration
   * is displayed.  Note that the acronym is included as part of each "tag" in the summary information
   * for the integration.  As a result, it is best to keep it to 4 or less characters.  The casing used
   * here will be carried forward into the notification window.
   *
   * @type String
   * @required
   */
  acronym: 'TRPX',
  /**
   * Description for this integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @optional
   */
  description:
    'TrapX DeceptionGrid protects your valuable assets against a multitude of attacks including malicious insiders and sophisticated cybercriminals',
  entityTypes: ['IPv4'],
  /**
   * Provide custom component logic and template for rendering the integration details block.  If you do not
   * provide a custom template and/or component then the integration will display data as a table of key value
   * pairs.
   *
   * @type Object
   * @optional
   */
  block: {
    component: {
      file: './components/tx-block.js'
    },
    template: {
      file: './templates/tx-block.hbs'
    }
  },
  summary: {
    component: {
      file: './components/tx-summary.js'
    },
    template: {
      file: './templates/tx-summary.hbs'
    }
  },
  request: {
    // Provide the path to your certFile. Leave an empty string to ignore this option.
    // Relative paths are relative to the TrapX integration's root directory
    cert: '',
    // Provide the path to your private key. Leave an empty string to ignore this option.
    // Relative paths are relative to the TrapX integration's root directory
    key: '',
    // Provide the key passphrase if required.  Leave an empty string to ignore this option.
    // Relative paths are relative to the TrapX integration's root directory
    passphrase: '',
    // Provide the Certificate Authority. Leave an empty string to ignore this option.
    // Relative paths are relative to the TrapX integration's root directory
    ca: '',
    // An HTTP proxy to be used. Supports proxy Auth with Basic Auth, identical to support for
    // the url parameter (by embedding the auth info in the uri)
    proxy: '',

    rejectUnauthorized: true
  },
  logging: {
    level: 'info' //trace, debug, info, warn, error, fatal
  },
  /**
   * Options that are displayed to the user/admin in the Polarity integration user-interface.  Should be structured
   * as an array of option objects.
   *
   * @type Array
   * @optional
   */
  options: [
    {
      key: 'url',
      name: 'TrapX DeceptionGrid URL',
      description: 'The base URL for the DeceptionGrid TSOC API including the schema (i.e., https://)',
      type: 'text',
      default: '',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'apiKey',
      name: 'API Key',
      description: 'Valid TrapX API Key.',
      default: '',
      type: 'password',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'trapType',
      name: 'Trap Type to search',
      description:
        'Search Events with the specified Trap Type (Full OS or Emulation)',
      default: {
        value: 'Full OS',
        display: 'Full OS'
      },
      type: 'select',
      options: [
        {
          value: 'Full OS',
          display: 'Full OS'
        },
        {
          value: 'Emulation',
          display: 'Emulation'
        }
      ],
      multiple: false,
      userCanEdit: true,
      adminOnly: false
    }
  ]
};
