import React, { useState } from 'react';
import { Label } from '@radix-ui/react-label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

interface DigitalizationLevelSelectorProps {
  label: string;
  onValueChange: (current: string, tobe: string, comment: string) => void;
  initialCurrent: string | undefined;
  initialToBe: string | undefined;
  initialComment: string | undefined;
}

const levels = [
  { value: '1', label: 'Level 1: Basic' },
  { value: '2', label: 'Level 2: Developing' },
  { value: '3', label: 'Level 3: Proficient' },
  { value: '4', label: 'Level 4: Advanced' },
  { value: '5', label: 'Level 5: Leading' },
];

const DigitalizationLevelSelector: React.FC<DigitalizationLevelSelectorProps> = ({
  label,
  onValueChange,
  initialCurrent = '',
  initialToBe = '',
  initialComment = '',
}) => {
  const [currentLevel, setCurrentLevel] = useState(initialCurrent);
  const [toBeLevel, setToBeLevel] = useState(initialToBe);
  const [comment, setComment] = useState(initialComment);

  React.useEffect(() => {
    onValueChange(currentLevel, toBeLevel, comment);
  }, [currentLevel, toBeLevel, comment, onValueChange]);

  return (
    <div className="grid gap-4">
      <Label className="text-lg font-semibold">{label}</Label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${label}-current`} className="mb-2 block">Current State</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {currentLevel ? levels.find(l => l.value === currentLevel)?.label : "Select current level"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {levels.map((level) => (
                <DropdownMenuItem key={level.value} onSelect={() => setCurrentLevel(level.value)}>
                  {level.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <Label htmlFor={`${label}-tobe`} className="mb-2 block">To-Be State</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {toBeLevel ? levels.find(l => l.value === toBeLevel)?.label : "Select to-be level"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {levels.map((level) => (
                <DropdownMenuItem key={level.value} onSelect={() => setToBeLevel(level.value)}>
                  {level.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div>
        <Label htmlFor={`${label}-comment`} className="mb-2 block">Comments</Label>
        <Textarea
          id={`${label}-comment`}
          placeholder="Add comments about current and to-be states..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
        />
      </div>
    </div>
  );
};

export default DigitalizationLevelSelector;