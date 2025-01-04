export = GCSStore;
declare class GCSStore {
    constructor(initParams: {
        gcsClient: import("@google-cloud/storage").Storage;
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
    sessionExists(options: any): Promise<[boolean]>;
    save(options: any): Promise<any>;
    extract(options: any): Promise<any>;
    delete(options: any): Promise<[import("teeny-request").Response<any>]>;
    #private;
}
declare namespace GCSStore {
    export { GCSStore, GCSStore as default };
}
