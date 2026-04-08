import Setting from '../models/Setting.js';

export const getPublicSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne({});
    if (!settings) return res.json({});
    return res.json({
      bannerEnabled: settings.bannerEnabled,
      bannerText: settings.bannerText,
      bannerImageUrl: settings.bannerImageUrl,
    });
  } catch (err) {
    console.error('getPublicSettings error', err);
    return res.status(500).json({ error: err.message });
  }
};

export const adminUpdateSettings = async (req, res) => {
  try {
    const { bannerEnabled, bannerText, bannerImageUrl } = req.body;
    let settings = await Setting.findOne({});
    if (!settings) settings = new Setting({});

    if (typeof bannerEnabled !== 'undefined') settings.bannerEnabled = !!bannerEnabled;
    if (typeof bannerText !== 'undefined') settings.bannerText = String(bannerText || '');
    if (typeof bannerImageUrl !== 'undefined') settings.bannerImageUrl = String(bannerImageUrl || '');

    await settings.save();
    return res.json({
      bannerEnabled: settings.bannerEnabled,
      bannerText: settings.bannerText,
      bannerImageUrl: settings.bannerImageUrl,
    });
  } catch (err) {
    console.error('adminUpdateSettings error', err);
    return res.status(500).json({ error: err.message });
  }
};
