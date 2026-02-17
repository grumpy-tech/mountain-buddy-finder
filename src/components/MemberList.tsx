import type { SessionMember } from '@/hooks/useSession';

const COLORS = [
  'bg-ice', 'bg-sunset', 'bg-pine', 'bg-pink-400',
  'bg-purple-400', 'bg-yellow-400', 'bg-orange-400', 'bg-emerald-400',
];

interface MemberListProps {
  members: SessionMember[];
  myMemberId: string | null;
}

export default function MemberList({ members, myMemberId }: MemberListProps) {
  function getTimeSince(lastSeen: string | null): string {
    if (!lastSeen) return 'Waiting...';
    const diff = Date.now() - new Date(lastSeen).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Live';
    if (mins < 60) return `${mins}m`;
    return `${Math.floor(mins / 60)}h`;
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 px-1">
      {members.map((member, i) => {
        const isMe = member.id === myMemberId;
        const hasSignal = member.latitude !== null;
        return (
          <div
            key={member.id}
            className="flex items-center gap-2 bg-card rounded-full px-3 py-2 shrink-0 border border-border"
          >
            <div className={`w-3 h-3 rounded-full ${hasSignal ? COLORS[i % COLORS.length] : 'bg-muted-foreground'}`} />
            <span className="text-sm font-medium text-foreground whitespace-nowrap">
              {member.username}
              {isMe && <span className="text-muted-foreground ml-1 text-xs">(you)</span>}
            </span>
            <span className={`text-xs ${hasSignal ? 'text-pine' : 'text-muted-foreground'}`}>
              {getTimeSince(member.last_seen)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
