import { useState } from 'react';
import { adminService } from '../../services/adminService.js';

export default function AdminPage() {
  const [matchForm, setMatchForm] = useState({
    teamA: '',
    teamB: '',
    matchTime: '',
    status: 'upcoming',
    teamALogo: '',
    teamBLogo: ''
  });
  const [questionForm, setQuestionForm] = useState({
    matchId: '',
    categoryId: '',
    question: '',
    options: ''
  });
  const [message, setMessage] = useState('');

  const handleMatch = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
  const [templateForm, setTemplateForm] = useState({
    matchId: '',
    player1: '',
    player2: '',
    bowler1: '',
    bowler2: '',
    starBatsman: '',
    starBowler: ''
  });
      await adminService.addMatch({ ...matchForm });
      setMessage('Match created');
    } catch (err) {
      setMessage(err.response?.data?.message ?? 'Failed');
    }
  };

  const handleQuestion = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const options = questionForm.options.split(',').map((label) => ({ label: label.trim() }));
      await adminService.addQuestion({ ...questionForm, options });
      setMessage('Question added');
  const handleCreateTemplates = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const players = {
        player1: templateForm.player1,
        player2: templateForm.player2,
        bowler1: templateForm.bowler1,
        bowler2: templateForm.bowler2,
        starBatsman: templateForm.starBatsman,
        starBowler: templateForm.starBowler
      };
      await adminService.createTemplates(templateForm.matchId, { players });
      setMessage('Templates created');
    } catch (err) {
      setMessage(err.response?.data?.message ?? 'Failed');
    }
  };
    } catch (err) {
      setMessage(err.response?.data?.message ?? 'Failed');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Admin Controls</h2>
      <form className="space-y-3 glass p-4 rounded-2xl border border-border" onSubmit={handleMatch}>
        <p className="font-semibold">Add Match</p>
        <TwoCol>
          <Input label="Team A" value={matchForm.teamA} onChange={(e) => setMatchForm({ ...matchForm, teamA: e.target.value })} />
          <Input label="Team B" value={matchForm.teamB} onChange={(e) => setMatchForm({ ...matchForm, teamB: e.target.value })} />
        </TwoCol>
        <TwoCol>
          <Input label="Team A Logo" value={matchForm.teamALogo} onChange={(e) => setMatchForm({ ...matchForm, teamALogo: e.target.value })} />
          <Input label="Team B Logo" value={matchForm.teamBLogo} onChange={(e) => setMatchForm({ ...matchForm, teamBLogo: e.target.value })} />
        </TwoCol>
        <TwoCol>
          <Input label="Match Time" type="datetime-local" value={matchForm.matchTime} onChange={(e) => setMatchForm({ ...matchForm, matchTime: e.target.value })} />
          <Input label="Status" value={matchForm.status} onChange={(e) => setMatchForm({ ...matchForm, status: e.target.value })} />
        </TwoCol>
        <button className="w-full bg-accent text-black font-semibold py-3 rounded-xl" type="submit">Create Match</button>
      </form>

      <form className="space-y-3 glass p-4 rounded-2xl border border-border" onSubmit={handleQuestion}>
        <p className="font-semibold">Add Question</p>
        <TwoCol>
          <Input label="Match ID" value={questionForm.matchId} onChange={(e) => setQuestionForm({ ...questionForm, matchId: e.target.value })} />
          <Input label="Category ID" value={questionForm.categoryId} onChange={(e) => setQuestionForm({ ...questionForm, categoryId: e.target.value })} />
        </TwoCol>
      <form className="space-y-3 glass p-4 rounded-2xl border border-border" onSubmit={handleCreateTemplates}>
        <p className="font-semibold">Create Set &amp; Forget Templates (20)</p>
        <TwoCol>
          <Input label="Match ID" value={templateForm.matchId} onChange={(e) => setTemplateForm({ ...templateForm, matchId: e.target.value })} />
          <Input label="Player 1" value={templateForm.player1} onChange={(e) => setTemplateForm({ ...templateForm, player1: e.target.value })} />
        </TwoCol>
        <TwoCol>
          <Input label="Player 2" value={templateForm.player2} onChange={(e) => setTemplateForm({ ...templateForm, player2: e.target.value })} />
          <Input label="Bowler 1" value={templateForm.bowler1} onChange={(e) => setTemplateForm({ ...templateForm, bowler1: e.target.value })} />
        </TwoCol>
        <TwoCol>
          <Input label="Bowler 2" value={templateForm.bowler2} onChange={(e) => setTemplateForm({ ...templateForm, bowler2: e.target.value })} />
          <Input label="Star Batsman" value={templateForm.starBatsman} onChange={(e) => setTemplateForm({ ...templateForm, starBatsman: e.target.value })} />
        </TwoCol>
        <Input label="Star Bowler" value={templateForm.starBowler} onChange={(e) => setTemplateForm({ ...templateForm, starBowler: e.target.value })} />
        <button className="w-full bg-accent text-black font-semibold py-3 rounded-xl" type="submit">Create Templates</button>
      </form>
        <Input label="Question" value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })} />
        <Input label="Options (comma separated)" value={questionForm.options} onChange={(e) => setQuestionForm({ ...questionForm, options: e.target.value })} />
        <button className="w-full bg-accent text-black font-semibold py-3 rounded-xl" type="submit">Add Question</button>
      </form>
      {message && <p className="text-sm text-accent">{message}</p>}
    </div>
  );
}

function Input({ label, type = 'text', ...rest }) {
  return (
    <label className="block text-sm space-y-1">
      <span className="text-gray-300">{label}</span>
      <input
        type={type}
        className="w-full bg-white border border-border rounded-xl px-3 py-3 focus:border-accent outline-none"
        {...rest}
      />
    </label>
  );
}

function TwoCol({ children }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}
