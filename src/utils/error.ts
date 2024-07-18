const GenericErrorMessage = "Something went wrong, we couldn't fullfil your request";

export const CredentialsErrorCode = 'credentials-error';

const errorCodeMessageMap: Record<string, string> = {
	[CredentialsErrorCode]: 'Something went wrong validating the credentials. Sign in again',
};

export function getErrorMessage(errorCode: string | undefined) {
	if (!errorCode) {
		return GenericErrorMessage;
	}

	return errorCodeMessageMap[errorCode] || GenericErrorMessage;
}
