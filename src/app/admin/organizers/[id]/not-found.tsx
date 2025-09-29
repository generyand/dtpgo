import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, UserX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <UserX className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Organizer Not Found</CardTitle>
            <CardDescription>
              The organizer you&apos;re looking for doesn&apos;t exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              This organizer may have been deleted, or the link you followed is incorrect.
            </p>
            <Button asChild>
              <Link href="/admin/organizers">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Organizers
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
