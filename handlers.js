const devWebhook = 'https://graceful-mvp-4b0y2.ampt.app/notify';
const prodWebhook = ""//'https://roamingtriggers.com/notify';

export const handleCRSDrawsUpdate = async (payload) => {
    console.log('CRSDraws update received:', payload);
    // Process the payload as needed
    // make a fetch call to a webhook
    console.log('Sending webhook to:', devWebhook);
    const response = await fetch(devWebhook, {
        method: 'GET',
    });
    const data = await response.json();
    console.log('Response from webhook:', data);
};
