import { LIVE_CHANNELS, getLiveChannelById } from '../../data/liveChannels';

export default function handler(req, res) {
  const { id } = req.query;

  if (id) {
    const channel = getLiveChannelById(id);
    if (!channel) {
      return res.status(404).json({ error: 'Live channel not found' });
    }
    return res.status(200).json(channel);
  }

  return res.status(200).json({ results: LIVE_CHANNELS });
}
