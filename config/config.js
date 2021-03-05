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
  acronym: 'TRAPX',
  /**
   * Description for this integration which is displayed in the Polarity integrations user interface
   *
   * @type String
   * @optional
   */
  description:
    'TrapX DeceptionGrid is the industry’s first software platform that activates Active Defense to enable security teams to proactively plan, deploy, test and refine Deception deployments against attack scenarios outlined in MITRE ATT&CK.',
  entityTypes: ['IPv4', 'domain'],
  styles: ['./styles/style.less'],
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
      name: 'TSOC URL',
      description: 'The base URL for your TSOC instance including the schema and port (i.e., https://mytrapx:8443)',
      type: 'text',
      default: '',
      userCanEdit: false,
      adminOnly: true
    },
    {
      key: 'apiKey',
      name: 'API Key',
      description: 'Valid TrapX TSOC API Key.',
      default: '',
      type: 'password',
      userCanEdit: true,
      adminOnly: false
    },
    {
      key: 'trapType',
      name: 'Trap Type to Search',
      description:
        'Search Events with the specified trap type (Full OS, Emulation or NIS).',
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
        },
        {
          value: 'NIS',
          display: 'NIS'
        }
      ],
      multiple: false,
      userCanEdit: true,
      adminOnly: false
    }
  ]
};
