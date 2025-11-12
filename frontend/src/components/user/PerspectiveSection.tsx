import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import DigitalizationLevelSelector from './DigitalizationLevelSelector';

interface PerspectiveSectionProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  onValueChange: (perspective: string, current: string, tobe: string, comment: string) => void;
  initialCurrent: string | undefined;
  initialToBe: string | undefined;
  initialComment: string | undefined;
}

const PerspectiveSection: React.FC<PerspectiveSectionProps> = ({
  title,
  description,
  children,
  onValueChange,
  initialCurrent,
  initialToBe,
  initialComment,
}) => {
  const handleDigitalizationLevelChange = (current: string, tobe: string, comment: string) => {
    onValueChange(title, current, tobe, comment);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <DigitalizationLevelSelector
          label="Digitalization Level"
          onValueChange={handleDigitalizationLevelChange}
          initialCurrent={initialCurrent}
          initialToBe={initialToBe}
          initialComment={initialComment}
        />
        {children}
      </CardContent>
    </Card>
  );
};

export default PerspectiveSection;