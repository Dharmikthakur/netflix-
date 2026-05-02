import { getServerSession } from 'next-auth/next';
import { authOptions } from './auth/[...nextauth]';
import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await dbConnect();
  const userId = session.user.id;

  try {
    if (req.method === 'GET') {
      const user = await User.findById(userId);
      return res.status(200).json({ myList: user.myList || [] });
    }

    if (req.method === 'POST') {
      const movie = req.body;
      const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { myList: movie } },
        { new: true }
      );
      return res.status(200).json({ myList: user.myList });
    }

    if (req.method === 'DELETE') {
      const { id } = req.body;
      const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { myList: { id: id } } },
        { new: true }
      );
      return res.status(200).json({ myList: user.myList });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('MyList API error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
