/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_upload_file_files_upload_post } from '../models/Body_upload_file_files_upload_post';
import type { FileOut } from '../models/FileOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FilesService {
    /**
     * List Files
     * Lista todos os arquivos pertencentes ao usuário logado.
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static listFilesFilesGet(): CancelablePromise<Array<FileOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/files',
        });
    }
    /**
     * Get File Metadata
     * Retorna metadados do arquivo (sem enviar o conteúdo).
     * Útil para mostrar lista e detalhes sem baixar.
     * @param fileId
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static getFileMetadataFilesFileIdGet(
        fileId: number,
    ): CancelablePromise<FileOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/files/{file_id}',
            path: {
                'file_id': fileId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Download File
     * Retorna o PDF como FileResponse (streaming).
     * Verifica pertencimento e existência do arquivo.
     * @param fileId
     * @returns any PDF file (application/pdf)
     * @throws ApiError
     */
    public static downloadFileFilesFileIdDownloadGet(
        fileId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/files/{file_id}/download',
            path: {
                'file_id': fileId,
            },
            errors: {
                401: `Unauthorized`,
                403: `Forbidden`,
                404: `Not found`,
                422: `Validation Error`,
            },
        });
    }
    /**
     * Upload File
     * @param formData
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static uploadFileFilesUploadPost(
        formData: Body_upload_file_files_upload_post,
    ): CancelablePromise<FileOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/files/upload',
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
