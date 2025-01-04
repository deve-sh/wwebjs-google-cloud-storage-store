// @ts-check
const fs = require("fs");

class GCSStore {
	/**
	 * @type {import('@google-cloud/storage')}
	 */
	client;

	constructor(
		/**
		 * @type {{ gcsClient: import('@google-cloud/storage') }}
		 */
		initParams
	) {
		if (!initParams || !initParams.gcsClient)
			throw new Error(
				"A valid Google Cloud Storage client is required in initParams: { gcsClient }"
			);
		this.client = initParams.gcsClient;
	}

	async sessionExists(options) {}

	async save(options) {}

	async extract(options) {}

	async delete(options) {}
}

module.exports = GCSStore;
