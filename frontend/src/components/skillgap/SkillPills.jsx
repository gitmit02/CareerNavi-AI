import { Check, Plus } from "lucide-react";
import Badge from "../ui/Badge";

export const SkillPills = ({ skills = [], variant = "default", icon }) => {
  if (!skills.length) {
    return <p className="text-sm text-muted italic">None listed</p>;
  }
  const Icon = icon;
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <Badge key={skill} variant={variant}>
          {Icon && <Icon size={12} />}
          {skill}
        </Badge>
      ))}
    </div>
  );
};

export const MatchedSkills = ({ skills }) => (
  <SkillPills skills={skills} variant="success" icon={Check} />
);

export const MissingSkills = ({ skills }) => (
  <SkillPills skills={skills} variant="danger" icon={Plus} />
);
