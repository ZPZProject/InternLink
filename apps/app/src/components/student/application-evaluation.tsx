import { getI18n } from "@/locales/server";
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

export async function ApplicationEvaluation({
  evaluation,
}: {
  evaluation: Evaluation;
}) {
  const t = await getI18n();

  if (!evaluation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("applicationEvaluation.title")}</CardTitle>
          <CardDescription>
            {t("applicationEvaluation.notYetSubmitted")}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const supervisorName =
    `${evaluation.supervisor?.first_name ?? ""} ${evaluation.supervisor?.last_name ?? ""}`.trim();

  const dateStr = new Date(evaluation.created_at).toLocaleDateString();
  const byName = supervisorName || evaluation.supervisor?.email || null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle>{t("applicationEvaluation.title")}</CardTitle>
          <Badge variant="blue">
            {t("applicationEvaluation.scoreLabel", {
              score: evaluation.score,
            })}
          </Badge>
        </div>
        <CardDescription>
          {t("applicationEvaluation.submittedOn", { date: dateStr })}
          {byName
            ? ` ${t("applicationEvaluation.submittedBy", { name: byName })}`
            : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-6 text-muted-foreground">
          {evaluation.comment?.trim() ||
            t("applicationEvaluation.noComment")}
        </p>
      </CardContent>
    </Card>
  );
}
