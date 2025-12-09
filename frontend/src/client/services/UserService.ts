/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_update_profile_user_profile_put } from '../models/Body_update_profile_user_profile_put';
import type { UserProfileOut } from '../models/UserProfileOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * Update Profile
     * @param fullName
     * @param description
     * @param formData
     * @returns UserProfileOut Successful Response
     * @throws ApiError
     */
    public static updateProfileUserProfilePut(
        fullName?: (string | null),
        description?: (string | null),
        formData?: Body_update_profile_user_profile_put,
    ): CancelablePromise<UserProfileOut> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/user/profile',
            query: {
                'full_name': fullName,
                'description': description,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }
}
