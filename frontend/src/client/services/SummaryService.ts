/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { SummaryCreateMulti } from '../models/SummaryCreateMulti';
import type { SummaryOut } from '../models/SummaryOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SummaryService {
    /**
     * Summarize Single File
     * @param fileId
     * @returns SummaryOut Successful Response
     * @throws ApiError
     */
    public static summarizeSingleFileSummarySinglePost(
        fileId: number,
    ): CancelablePromise<SummaryOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/summary/single',
            query: {
                'file_id': fileId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * Summarize Multi Files
     * @param requestBody
     * @returns SummaryOut Successful Response
     * @throws ApiError
     */
    public static summarizeMultiFilesSummaryMultiPost(
        requestBody: SummaryCreateMulti,
    ): CancelablePromise<SummaryOut> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/summary/multi',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }
    /**
     * List Summaries
     * @returns SummaryOut Successful Response
     * @throws ApiError
     */
    public static listSummariesSummaryGet(): CancelablePromise<Array<SummaryOut>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/summary/',
        });
    }
    /**
     * Get Summary
     * @param summaryId
     * @returns SummaryOut Successful Response
     * @throws ApiError
     */
    public static getSummarySummarySummaryIdGet(
        summaryId: number,
    ): CancelablePromise<SummaryOut> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/summary/{summary_id}',
            path: {
                'summary_id': summaryId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
