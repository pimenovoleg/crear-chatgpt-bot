import fetch from 'node-fetch';

export const getPic = async (prompt) => {
    const response = await fetch(
        'https://api.stability.ai/v1alpha/generation/stable-diffusion-512-v2-1/text-to-image',
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'image/png',
                Authorization: process.env.STABILITY_KEY
            },
            body: JSON.stringify({
                cfg_scale: 7,
                clip_guidance_preset: 'FAST_BLUE',
                height: 512,
                width: 512,
                samples: 1,
                steps: 30,
                text_prompts: [
                    {
                        text: prompt,
                        weight: 1
                    }
                ]
            })
        }
    );

    if (!response.ok) {
        console.error(`Stability AI error: ${(await response.text())?.split('\n')?.[0]?.substring(0, 200)}`);
        return;
    }

    return response.buffer();
};
