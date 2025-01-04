import fs from "node:fs";
import assert from "node:assert";
import test, { after, before, describe } from "node:test";

import { MockStorage as Storage } from "mock-gcs";

import GCSStore from "./index.js";

describe("Tests for WhatsApp-Web.js Google Cloud Storage RemoteAuth Strategy Store", () => {
	const storage = new Storage();

	const commonSessionDetailsAndOptions = {
		session: "dummy-session-id",
		path: "./sample.zip",
	};

	const commonValidInitParams = {
		client: storage,
		bucketName: "dummy-bucket",
		basePathInBucket: "folder-inside-bucket/",
	};

	const commonValidStore = new GCSStore(commonValidInitParams);

	before(() => {
		if (!fs.existsSync(commonSessionDetailsAndOptions.path))
			fs.writeFileSync(
				commonSessionDetailsAndOptions.session + ".zip",
				"dummy-file-contents"
			);
	});

	after(() => {
		if (fs.existsSync(commonSessionDetailsAndOptions.path))
			fs.unlinkSync(commonSessionDetailsAndOptions.path);

		if (fs.existsSync(commonSessionDetailsAndOptions.session + ".zip"))
			fs.unlinkSync(commonSessionDetailsAndOptions.session + ".zip");
	});

	test("error is thrown on incorrect or empty instantiation parameters [sanity]", () => {
		try {
			// Empty Instantiation Parameters
			new GCSStore();
		} catch (error) {
			assert.match(
				error.message,
				/A valid set of instantiation parameters are required/gi
			);
		}

		try {
			// Invalid Instantiation Parameters
			new GCSStore({ client: null });
		} catch (error) {
			assert.match(
				error.message,
				/A valid Google Cloud Storage client is required in initParams/gi
			);
		}

		try {
			new GCSStore({ client: storage });
		} catch (error) {
			assert.match(
				error.message,
				/A valid Google Cloud Storage bucket name is required in initParams/gi
			);
		}

		// Valid instantiation
		new GCSStore({ client: storage, bucketName: "dummy-bucket" });
		assert.equal(1, 1);

		try {
			new GCSStore({
				client: storage,
				bucketName: "dummy-bucket",
				basePathInBucket: "folder-inside-bucket",
			});
		} catch (error) {
			assert.match(
				error.message,
				/A valid Google Cloud Storage bucket base path name is required in the format: \{pathFragments...\}/gi
			);
		}

		try {
			new GCSStore({
				client: storage,
				bucketName: "dummy-bucket",
				basePathInBucket: "/",
			});
		} catch (error) {
			assert.match(
				error.message,
				/A valid Google Cloud Storage bucket base path name is required in the format: \{pathFragments...\}/gi
			);
		}
	});

	test("instantiation of store class happens correctly [sanity]", () => {
		assert.equal(
			commonValidStore.basePathInBucket,
			commonValidInitParams.basePathInBucket
		);
		assert.equal(commonValidStore.bucketName, commonValidInitParams.bucketName);
		assert.equal(commonValidStore.client, commonValidInitParams.client);

		// Params not passed should not be present
		assert.equal(Object.keys(commonValidStore.bucketClientOptions).length, 0);
		assert.equal(commonValidStore.localBaseDirectory, "");
	});

	test("all required methods in the store class are present [sanity]", () => {
		assert.equal(typeof commonValidStore.sessionExists, "function");
		assert.equal(typeof commonValidStore.save, "function");
		assert.equal(typeof commonValidStore.extract, "function");
		assert.equal(typeof commonValidStore.delete, "function");
	});

	test("sessionExists and save methods work as expected", async () => {
		assert.equal(
			await commonValidStore.sessionExists(commonSessionDetailsAndOptions),
			false
		);

		await commonValidStore.save(commonSessionDetailsAndOptions);

		assert.equal(
			await commonValidStore.sessionExists(commonSessionDetailsAndOptions),
			true
		);
	});

	test("extract method works as expected", async () => {
		await commonValidStore.extract(commonSessionDetailsAndOptions);

		// File should be created locally at a specified path from the uploaded zip file
		assert.equal(fs.existsSync(commonSessionDetailsAndOptions.path), true);
		assert.equal(
			fs.readFileSync(commonSessionDetailsAndOptions.path, "utf-8"),
			"dummy-file-contents"
		);
	});

	test("delete method works as expected", async () => {
		await commonValidStore.delete(commonSessionDetailsAndOptions);
		assert.equal(await commonValidStore.sessionExists(), false);
	});
});
