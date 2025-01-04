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
	basePath;

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
		 * 	  basePath?: string;
		 * 	  localBaseDirectory?: string;
		 * }}
		 */
		initParams
	) {
		if (!initParams)
			throw new Error(
				"A valid set of instantiation parameters are required: { gcsClient, bucketName, basePath?, bucketClientOptions? }"
			);

		if (!initParams.gcsClient)
			throw new Error(
				"A valid Google Cloud Storage client is required in initParams: { gcsClient, bucketName, basePath?, bucketClientOptions? }"
			);

		if (!initParams.bucketName || typeof initParams.bucketName !== "string")
			throw new Error(
				"A valid Google Cloud Storage bucket name is required in initParams: { gcsClient, bucketName, basePath?, bucketClientOptions? }"
			);

		if (
			initParams.basePath &&
			(initParams.basePath.length === 1 || !initParams.basePath.endsWith("/"))
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
		this.basePath = initParams.basePath || "";
		this.localBaseDirectory = initParams.localBaseDirectory || "";
	}

	#getSessionZipPathInRemoteBucket(options) {
		return (this.basePath || "") + options.session + "/session.zip";
	}

	#getSessionZipFileRefInRemoteBucket(options) {
		const bucketClient = this.client.bucket(this.bucketName);
		const fileRef = bucketClient.file(
			this.#getSessionZipPathInRemoteBucket(options)
		);

		return fileRef;
	}

	async sessionExists(options) {
		const fileRef = this.#getSessionZipFileRefInRemoteBucket(options);
		return await fileRef.exists();
	}

	async save(options) {
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

	async extract(options) {
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

	async delete(options) {
		return await this.#getSessionZipFileRefInRemoteBucket(options).delete({
			ignoreNotFound: true,
		});
	}
}

module.exports = GCSStore;
