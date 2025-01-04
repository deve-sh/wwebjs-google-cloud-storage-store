export = GCSStore;
declare class GCSStore {
    constructor(initParams: {
        client: import("@google-cloud/storage").Storage;
        bucketName: string;
        bucketClientOptions?: import("@google-cloud/storage").BucketOptions;
        basePathInBucket?: string;
        localBaseDirectory?: string;
    });
    /**
     * @type {import('@google-cloud/storage').Storage}
     */
    client: import("@google-cloud/storage").Storage;
    /**
     * @type {string}
     */
    basePathInBucket: string;
    /**
     * @type {string}
     */
    bucketName: string;
    /**
     * @type {import('@google-cloud/storage').BucketOptions}
     */
    bucketClientOptions: import("@google-cloud/storage").BucketOptions;
    /**
     * Use in case of docker containers that only have access to os.tmpdir
     * @type {string}
     */
    localBaseDirectory: string;
    sessionExists(options: Parameters<import("whatsapp-web.js").Store["sessionExists"]>[0]): Promise<boolean>;
    save(options: Parameters<import("whatsapp-web.js").Store["save"]>[0]): Promise<any>;
    extract(options: Parameters<import("whatsapp-web.js").Store["extract"]>[0]): Promise<any>;
    delete(options: Parameters<import("whatsapp-web.js").Store["delete"]>[0]): Promise<[import("teeny-request").Response<any>]>;
}
declare namespace GCSStore {
    export { GCSStore, GCSStore as default };
}
