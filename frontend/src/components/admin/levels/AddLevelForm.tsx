import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAddDigitalisationLevel } from "@/hooks/digitalisationLevels/useAddDigitalisationLevel";
import { useDimension } from "@/hooks/dimensions/useDimension";
import {
  IDigitalisationLevel,
  LevelState,
  LevelType,
} from "@/types/digitalisationLevel";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  description: z.string().optional(),
  state: z.coerce.number().min(1, "Please select a state").max(5),
});

type FormValues = z.infer<typeof formSchema>;

interface AddLevelFormProps {
  isOpen: boolean;
  onClose: () => void;
  dimensionId: string;
  levelType: LevelType;
  existingLevels: IDigitalisationLevel[];
}

const currentStateDescriptions: Record<string, string[]> = {
  Technology: [
    "Legacy Systems",
    "Basic Digital Tools",
    "Partial Automation",
    "Cloud-Enabled",
    "Highly Scalable & Integrated",
  ],
  "Digital Culture": [
    "Digital Resistance",
    "Basic minimal Adoption",
    "Willing but Inconsistent",
    "Adoption with Leadership Support",
    "Fully Embedded Digital Culture",
  ],
  Skills: [
    "Insufficient Digital Skills",
    "Basic Digital Skills",
    "Moderate Skills, Limited to Certain Areas",
    "Widespread Digital Proficiency",
    "Advanced Expertise",
  ],
  Processes: [
    "Manual and inefficient processes.",
    "Efficient but manual",
    "Partially Automated",
    "Fully Automated inefficient",
    "Fully Automated efficient / integrated",
  ],
  Cybersecurity: [
    "No Cybersecurity Measures",
    "Basic Security",
    "Standard Security Protocols",
    "Proactive Cybersecurity",
    "Comprehensive Security Framework",
  ],
  "Customer Experience": [
    "No Digital Customer Interaction",
    "Basic Digital Presence",
    "Limited Digital Channels",
    "Multiple Digital Channels",
    "Seamless Omnichannel Experience",
  ],
  "Data & Analytics": [
    "No Data Collection or Use",
    "Basic Data Collection",
    "Data for Operational Reporting",
    "Advanced Data Analytics",
    "Data-Driven Organization",
  ],
  Innovation: [
    "No Innovation",
    "Occasional Innovation",
    "Innovation with Limited Scope",
    "Proactive Innovation Culture",
    "Innovation Leader",
  ],
};

const desiredStateDescriptions: Record<string, string[]> = {
  Technology: [
    "Legacy Systems",
    "Basic Digital Tools",
    "Partial Automation",
    "Cloud-Enabled",
    "Highly Scalable & Integrated",
  ],
  "Digital Culture": [
    "Traditional Mindset (Analogue Culture)",
    "Digital Experimentation (Explorative Digital Culture)",
    "Digital Collaboration (Engaging Digital Culture)",
    "Adoption of Member-Centric Digitalization with Leadership Support (Integrative Digital Culture)",
    "Culture of Continuous Innovation and Digital Leadership (Transformative Digital Culture)",
  ],
  Skills: [
    "Insufficient Digital Literacy",
    "Basic Digital Literacy",
    "Functional Digital skills with limitations in certain areas",
    "Cross-functional and departmental Digital Competency",
    "Future-Ready Workforce with specialized expertise",
  ],
  Processes: [
    "Fully Manual Processes",
    "Digitized but Manual",
    "Partially Automated Processes",
    "Fully Automated Processes",
    "Integrated Automation through Digital Transformation",
  ],
  Cybersecurity: [
    "No Cybersecurity Measures",
    "Basic Security Measures",
    "Reactive Cybersecurity",
    "Proactive Cybersecurity",
    "Comprehensive Security Framework",
  ],
  "Customer Experience": [
    "No Digital Customer Interaction",
    "Basic Digital Presence",
    "Limited Digital Channels",
    "Multi-Channel Engagement",
    "Omnichannel Excellence",
  ],
  "Data & Analytics": [
    "No Data Collection or Use",
    "Basic Data Collection & Storage",
    "Operational Reporting Only",
    "Advanced Analytics & Insights",
    "Data-Driven Decision Making Culture",
  ],
  Innovation: [
    "No Focus on Innovation",
    "Occasional Innovation Efforts",
    "Focused Innovation Initiatives",
    "Proactive Innovation Culture",
    "Continuous Innovation & Disruption Leadership",
  ],
};

export const AddLevelForm = ({
  isOpen,
  onClose,
  dimensionId,
  levelType,
  existingLevels,
}: AddLevelFormProps) => {
  const { data: dimension } = useDimension(dimensionId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
    setValue,
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      state: 0,
      description: "",
    },
  });

  const addLevelMutation = useAddDigitalisationLevel();

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    const levelData = {
      dimension_id: dimensionId,
      score: data.state as LevelState,
      description: data.description ?? null,
      level: `Level ${data.state}`,
    };

    addLevelMutation.mutate(
      {
        dimensionId,
        levelType,
        levelData,
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const availableStates = [1, 2, 3, 4, 5].filter(
    (state) => !existingLevels.some((level) => level.state === state),
  );

  const descriptions =
    dimension && levelType === "current"
      ? currentStateDescriptions[dimension.name]
      : dimension
        ? desiredStateDescriptions[dimension.name]
        : undefined;

  const handleStateChange = (value: string) => {
    const state = parseInt(value, 10);
    setValue("state", state);
    if (descriptions) {
      setValue("description", descriptions[state - 1] ?? "");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Add New {levelType === "current" ? "Current" : "Desired"} Level
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="state"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={handleStateChange}
                defaultValue={field.value ? String(field.value) : ""}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  {availableStates.map((state) => (
                    <SelectItem key={state} value={String(state)}>
                      {descriptions
                        ? `${descriptions[state - 1]}`
                        : `State ${state}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.state && (
            <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
          )}

          <Textarea {...register("description")} placeholder="Description" />

          <DialogFooter>
            <Button type="submit" disabled={addLevelMutation.isPending}>
              {addLevelMutation.isPending ? "Adding..." : "Add Level"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
