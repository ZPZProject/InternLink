import { Badge } from "@v1/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@v1/ui/card";

type Evaluation = {
  score: number;
  comment: string | null;
  created_at: string;
  supervisor: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
} | null;

export function ApplicationEvaluation({
  evaluation,
}: {
  evaluation: Evaluation;
}) {
  if (!evaluation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Evaluation</CardTitle>
          <CardDescription>
            Your supervisor has not submitted an evaluation yet.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const supervisorName =
    `${evaluation.supervisor?.first_name ?? ""} ${evaluation.supervisor?.last_name ?? ""}`.trim();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>Evaluation</CardTitle>
          <Badge variant="blue">Score: {evaluation.score}</Badge>
        </div>
        <CardDescription>
          Submitted on {new Date(evaluation.created_at).toLocaleDateString()}
          {supervisorName || evaluation.supervisor?.email
            ? ` by ${supervisorName || evaluation.supervisor?.email}`
            : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          {evaluation.comment?.trim() || "No comment provided."}
        </p>
      </CardContent>
    </Card>
  );
}
