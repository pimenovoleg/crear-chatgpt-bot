import { TranslationServiceClient } from '@google-cloud/translate';

const translation = new TranslationServiceClient();

const GOOGLE_PROJECT = `projects/${process.env.GOOGLE_KEY}/locations/global`;

export const translate = async (text, target) => {
    try {
        const request = {
            parent: GOOGLE_PROJECT,
            contents: [text],
            mimeType: 'text/plain',
            targetLanguageCode: target
        };

        const [response] = await translation.translateText(request);
        return response.translations[0]?.translatedText;
    } catch (e) {
        console.error(e.message);
    }
};
