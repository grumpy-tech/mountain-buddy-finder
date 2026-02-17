import HomeScreen from '@/components/HomeScreen';
import SessionView from '@/components/SessionView';
import { useSession } from '@/hooks/useSession';

const Index = () => {
  const {
    session,
    members,
    memberId,
    loading,
    error,
    createSession,
    joinSession,
    updateLocation,
    leaveSession,
  } = useSession();

  if (session) {
    return (
      <SessionView
        session={session}
        members={members}
        memberId={memberId}
        onUpdateLocation={updateLocation}
        onLeave={leaveSession}
      />
    );
  }

  return (
    <HomeScreen
      onStart={createSession}
      onJoin={joinSession}
      loading={loading}
      error={error}
    />
  );
};

export default Index;
