export default function SkillChip({ skill }: { skill: string }) {
  return (
    <span className="skill inline-flex items-center px-3 py-1.5 text-xs font-kode-mono rounded-full border bg-card text-card-foreground border-border whitespace-nowrap">
      {skill}
    </span>
  );
}