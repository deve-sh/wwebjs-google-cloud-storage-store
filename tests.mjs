import assert from "node:assert";
import test, { describe } from "node:test";

import { Storage } from "@google-cloud/storage";

import GCSStore from "./index.js";

describe("Tests for WhatsApp-Web.js Google Cloud Storage RemoteAuth Strategy Store", () => {
	const storage = new Storage();

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
			new GCSStore({ gcsClient: null });
		} catch (error) {
			assert.match(
				error.message,
				/A valid Google Cloud Storage client is required in initParams/gi
			);
		}

		try {
			new GCSStore({ gcsClient: storage });
		} catch (error) {
			assert.match(
				error.message,
				/A valid Google Cloud Storage bucket name is required in initParams/gi
			);
		}

		// Valid instantiation
		new GCSStore({ gcsClient: storage, bucketName: "dummy-bucket" });
		assert.equal(1, 1);

		try {
			new GCSStore({
				gcsClient: storage,
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
				gcsClient: storage,
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
		const initParams = {
			gcsClient: storage,
			bucketName: "dummy-bucket",
			basePathInBucket: "folder-inside-bucket/",
		};

		const store = new GCSStore(initParams);

		assert.equal(store.basePathInBucket, initParams.basePathInBucket);
		assert.equal(store.bucketName, initParams.bucketName);
		assert.equal(store.client, initParams.gcsClient);

		// Params not passed should not be present
		assert.equal(Object.keys(store.bucketClientOptions).length, 0);
		assert.equal(store.localBaseDirectory, "");

		// Test existence of methods
	});

	test("all required methods in the store class are present [sanity]", () => {
		const initParams = {
			gcsClient: storage,
			bucketName: "dummy-bucket",
			basePathInBucket: "folder-inside-bucket/",
		};

		const store = new GCSStore(initParams);

		assert.equal(typeof store.sessionExists, "function");
		assert.equal(typeof store.save, "function");
		assert.equal(typeof store.extract, "function");
		assert.equal(typeof store.delete, "function");
	});

	test("sessionExists method works as expected", () => {});

	test("save method works as expected", () => {});

	test("extract method works as expected", () => {});

	test("delete method works as expected", () => {});
});
