import { useEffect } from 'react';
import { useSocket } from '../providers/SocketProvider.jsx';
import { useMatchStore } from '../store/matchStore.js';

export function useLiveUpdates() {
  const socket = useSocket();
  const { upsertMatchScore, upsertQuestion } = useMatchStore();

  useEffect(() => {
    if (!socket) return;
    socket.on('score:update', ({ matchId, teamAScore, teamBScore }) => {
      if (typeof teamAScore !== 'undefined') upsertMatchScore(matchId, 'A', teamAScore);
      if (typeof teamBScore !== 'undefined') upsertMatchScore(matchId, 'B', teamBScore);
    });
    socket.on('question:update', (question) => {
      upsertQuestion(question);
    });
    return () => {
      socket.off('score:update');
      socket.off('question:update');
    };
  }, [socket]);
}
