// @ts-check
const fs = require("fs");
const path = require("path");

class GCSStore {
	/**
	 * @type {import('@google-cloud/storage').Storage}
	 */
	client;

	/**
	 * @type {string}
	 */
	basePathInBucket;

	/**
	 * @type {string}
	 */
	bucketName;

	/**
	 * @type {import('@google-cloud/storage').BucketOptions}
	 */
	bucketClientOptions = {};

	/**
	 * Use in case of docker containers that only have access to os.tmpdir
	 * @type {string}
	 */
	localBaseDirectory = "";

	constructor(
		/**
		 * @type {{
		 * 	  gcsClient: import('@google-cloud/storage').Storage;
		 * 	  bucketName: string;
		 * 	  bucketClientOptions?: import('@google-cloud/storage').BucketOptions;
		 * 	  basePathInBucket?: string;
		 * 	  localBaseDirectory?: string;
		 * }}
		 */
		initParams
	) {
		if (!initParams)
			throw new Error(
				"A valid set of instantiation parameters are required: { gcsClient, bucketName, basePathInBucket?, bucketClientOptions? }"
			);

		if (!initParams.gcsClient)
			throw new Error(
				"A valid Google Cloud Storage client is required in initParams: { gcsClient, bucketName, basePathInBucket?, bucketClientOptions? }"
			);

		if (!initParams.bucketName || typeof initParams.bucketName !== "string")
			throw new Error(
				"A valid Google Cloud Storage bucket name is required in initParams: { gcsClient, bucketName, basePathInBucket?, bucketClientOptions? }"
			);

		if (
			initParams.basePathInBucket &&
			(initParams.basePathInBucket.length === 1 ||
				!initParams.basePathInBucket.endsWith("/"))
		)
			throw new Error(
				"A valid Google Cloud Storage bucket base path name is required in the format: {pathFragments...}/"
			);

		this.client = initParams.gcsClient;
		this.bucketName = initParams.bucketName || "";
		this.bucketClientOptions =
			initParams.bucketClientOptions &&
			typeof initParams.bucketClientOptions === "object"
				? initParams.bucketClientOptions
				: {};
		this.basePathInBucket = initParams.basePathInBucket || "";
		this.localBaseDirectory = initParams.localBaseDirectory || "";
	}

	#getSessionZipPathInRemoteBucket(
		/** @type {Partial<Parameters<import('whatsapp-web.js').Store['extract']>[0]>} */
		options
	) {
		return (
			(this.basePathInBucket || "") + (options.session || "") + "/session.zip"
		);
	}

	#getSessionZipFileRefInRemoteBucket(
		/**
		 * @type {Partial<Parameters<import('whatsapp-web.js').Store['extract']>[0]>}
		 */
		options
	) {
		const bucketClient = this.client.bucket(this.bucketName);
		const fileRef = bucketClient.file(
			this.#getSessionZipPathInRemoteBucket(options)
		);

		return fileRef;
	}

	async sessionExists(
		/**
		 * @type {Parameters<import('whatsapp-web.js').Store['sessionExists']>[0]}
		 */
		options
	) {
		try {
			const fileRef = this.#getSessionZipFileRefInRemoteBucket(options);
			const [exists] = await fileRef.exists();
			return exists;
		} catch {
			return false;
		}
	}

	async save(
		/**
		 * @type {Parameters<import('whatsapp-web.js').Store['save']>[0]}
		 */
		options
	) {
		return new Promise((resolve, reject) => {
			const localFilePath = path.resolve(
				this.localBaseDirectory,
				`${options.session}.zip`
			);

			if (!fs.existsSync(localFilePath))
				return reject(
					new Error(
						"Session file doesn't exist. Failed to save to cloud storage."
					)
				);

			const localFileReadStream = fs.createReadStream(localFilePath);

			const fileRefInRemoteBucket =
				this.#getSessionZipFileRefInRemoteBucket(options);

			const cloudWriteStream = fileRefInRemoteBucket.createWriteStream({
				metadata: { contentType: "application/zip" },
			});

			localFileReadStream
				.pipe(cloudWriteStream)
				.on("finish", resolve)
				.on("error", reject);
		});
	}

	async extract(
		/**
		 * @type {Parameters<import('whatsapp-web.js').Store['extract']>[0]}
		 */
		options
	) {
		return new Promise((resolve, reject) => {
			const fileRefInRemoteBucket =
				this.#getSessionZipFileRefInRemoteBucket(options);

			const localWriteStream = fs.createWriteStream(options.path);

			fileRefInRemoteBucket
				.createReadStream()
				.pipe(localWriteStream)
				.on("finish", resolve)
				.on("error", reject);
		});
	}

	async delete(
		/**
		 * @type {Parameters<import('whatsapp-web.js').Store['delete']>[0]}
		 */
		options
	) {
		return await this.#getSessionZipFileRefInRemoteBucket(options).delete({
			ignoreNotFound: true,
		});
	}
}

module.exports = GCSStore;
module.exports.GCSStore = GCSStore;
module.exports.default = GCSStore;
