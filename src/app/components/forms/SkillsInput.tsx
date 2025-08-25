import { useState, KeyboardEvent } from 'react';

interface SkillsInputProps {
  skills: string[];
  onChange: (skills: string[]) => void;
}

export default function SkillsInput({ skills, onChange }: SkillsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const addSkill = (skill: string) => {
    const trimmedSkill = skill.trim();
    
    if (!trimmedSkill) return;
    
    if (trimmedSkill.length > 50) {
      setError('Skill name must be 50 characters or less');
      return;
    }

    if (skills.includes(trimmedSkill)) {
      setError('Skill already added');
      return;
    }

    onChange([...skills, trimmedSkill]);
    setInputValue('');
    setError(null);
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addSkill(inputValue);
    } else if (event.key === 'Backspace' && !inputValue && skills.length > 0) {
      removeSkill(skills[skills.length - 1]);
    }
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    if (error) setError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 p-3 border border-gray-300 rounded-md min-h-[42px] focus-within:ring-2 focus-within:ring-emerald-500 focus-within:border-emerald-500">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-md"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="ml-1 text-emerald-600 hover:text-emerald-800 focus:outline-none"
              aria-label={`Remove ${skill}`}
            >
              <svg
                className="w-3 h-3"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={skills.length === 0 ? "e.g., Python, Typescript, Pandas, etc." : "Add another skill..."}
          className="flex-1 min-w-[200px] outline-none bg-transparent"
          maxLength={50}
        />
      </div>
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      <p className="text-xs text-gray-500">
        Press Enter or comma to add a skill. Press Backspace to remove the last skill.
      </p>
    </div>
  );
}