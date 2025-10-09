import { useState } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
export function FeedbackForm() {
  const [feedbackType, setFeedbackType] = useState<'yes' | 'no' | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!feedbackType) {
      toast({
        title: "Please select an option",
        description: "Let us know if the export met your needs",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exportResult: feedbackType,
          notes: notes || undefined,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          screenSize: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        }),
      });

      if (!response.ok) throw new Error('Feedback submission failed');

      toast({
        title: "Thank you for your feedback!",
        description: "Your feedback has been recorded successfully",
      });

      // Reset form
      setFeedbackType(null);
      setNotes("");
    } catch (error) {
      console.error('Feedback submission failed:', error);
      toast({
        title: "Submission failed",
        description: "Unable to submit feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Export Feedback
        </CardTitle>
        <CardDescription>
          Did the export meet your needs?
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={feedbackType === 'yes' ? 'default' : 'outline'}
            onClick={() => setFeedbackType('yes')}
            className="flex-1"
            data-testid="button-feedback-yes"
          >
            <ThumbsUp className="h-4 w-4 mr-2" />
            Yes
          </Button>
          <Button
            variant={feedbackType === 'no' ? 'default' : 'outline'}
            onClick={() => setFeedbackType('no')}
            className="flex-1"
            data-testid="button-feedback-no"
          >
            <ThumbsDown className="h-4 w-4 mr-2" />
            No
          </Button>
        </div>

        <Textarea
          placeholder="Additional comments (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="min-h-[100px]"
          data-testid="textarea-feedback-notes"
        />

        <Button
          onClick={handleSubmit}
          disabled={!feedbackType || isSubmitting}
          className="w-full"
          data-testid="button-feedback-submit"
        >
          Submit Feedback
        </Button>
      </CardContent>
    </Card>
  );
}
