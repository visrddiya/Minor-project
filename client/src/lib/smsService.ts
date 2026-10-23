export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
  isEnabled: boolean;
}

export const getTwilioConfig = (): TwilioConfig => {
  const saved = localStorage.getItem('queuesphere_twilio_config');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      // Fallback
    }
  }
  return {
    accountSid: '',
    authToken: '',
    fromNumber: '',
    isEnabled: false,
  };
};

export const saveTwilioConfig = (config: TwilioConfig) => {
  localStorage.setItem('queuesphere_twilio_config', JSON.stringify(config));
};

export const sendRealTwilioSMS = async (
  toPhone: string,
  message: string
): Promise<{ success: boolean; sid?: string; error?: string }> => {
  const config = getTwilioConfig();

  if (!config.isEnabled || !config.accountSid || !config.authToken || !config.fromNumber) {
    return {
      success: false,
      error: 'Twilio credentials not configured. Please enter your Account SID, Auth Token & From Number in settings.',
    };
  }

  // Format phone number to E.164 standard e.g. +919173351298
  let formattedTo = toPhone.trim();
  if (!formattedTo.startsWith('+')) {
    const digitsOnly = formattedTo.replace(/\D/g, '');
    formattedTo = digitsOnly.length === 10 ? `+91${digitsOnly}` : `+${digitsOnly}`;
  }

  try {
    const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`;
    const formData = new URLSearchParams();
    formData.append('To', formattedTo);
    formData.append('From', config.fromNumber);
    formData.append('Body', message);

    const authHeader = 'Basic ' + btoa(`${config.accountSid}:${config.authToken}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader,
      },
      body: formData,
    });

    const data = await response.json();

    if (response.ok && data.sid) {
      return { success: true, sid: data.sid };
    } else {
      return { success: false, error: data.message || data.detail || 'Twilio SMS request failed' };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error connecting to Twilio API' };
  }
};
