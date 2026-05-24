import { Badge } from "@v1/ui/badge";
import { Button } from "@v1/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@v1/ui/table";
import Link from "next/link";

type QueueItem = {
  application_id: string;
  student: {
    profiles: {
      first_name: string | null;
      last_name: string | null;
      email: string | null;
    };
    index_number: string | null;
    major: string | null;
  };
  offer: {
    title: string;
    companies: { name: string };
  };
  total_documents: number;
  pending_documents: number;
};

export function DocumentReviewTable({
  items,
}: {
  items: QueueItem[];
}) {
  if (items.length === 0) {
    return (
      <p className="text-muted-foreground py-12 text-center text-sm">
        No documents pending review. When students upload documents, they will
        appear here.
      </p>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead>Offer</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Documents</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.application_id}>
            <TableCell className="font-medium">
              {item.student.profiles.first_name} {item.student.profiles.last_name}
              <span className="block text-xs text-muted-foreground">
                {item.student.profiles.email}
              </span>
            </TableCell>
            <TableCell>{item.offer.title}</TableCell>
            <TableCell>{item.offer.companies.name}</TableCell>
            <TableCell>
              <Badge variant={item.pending_documents > 0 ? "amber" : "blue"}>
                {item.pending_documents} / {item.total_documents} pending
              </Badge>
            </TableCell>
            <TableCell>
              <Button asChild size="sm" variant="outline">
                <Link
                  href={`/supervisor/reviews/${item.application_id}`}
                >
                  Review
                </Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
