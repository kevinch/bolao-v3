"use client";

import clsx from "clsx";
import { Bolao } from "@/app/lib/definitions";
import { deleteBolaoGroup } from "../lib/controllerAdmin";
import { formatDateNews } from "@/app/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function AdminBolao({ bolao }: { bolao: Bolao }) {
  const [deleted, setDeleted] = useState(false);
  const { toast } = useToast();

  const actionDelete = async (bolaoId: string) => {
    const result = await deleteBolaoGroup(bolaoId);

    if (result.success) {
      setDeleted(true);
      toast({
        title: "Success",
        description: "The bolão was successfully deleted.",
        variant: "success",
      });
    } else {
      toast({
        description: "There was an issue with the deletion.",
        variant: "destructive",
      });
    }
  };

  const formatedDate = formatDateNews(bolao.created_at.toString());

  return (
    <Card key={bolao.id} className="mb-6">
      <CardHeader>
        <CardTitle>{bolao.name}</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between p-6 pt-0">
          <div>
            <div>Competition id: {bolao.competition_id}</div>
            <div>Id: ****{bolao.id.slice(-5)}</div>
            <div>Created by: ****{bolao.created_by.slice(-5)}</div>
            <div>Created at: {formatedDate}</div>
          </div>

          <div>
            {deleted ? (
              <span className={clsx("text-green-500")}>Deleted</span>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive">delete</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Delete bolão</DialogTitle>
                    <DialogDescription>
                      You have selected the bolão "<strong>{bolao.name}</strong>
                      ".
                      <br />
                      Once confirmed, this action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="secondary">Cancel</Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => actionDelete(bolao.id)}
                    >
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AdminBolao;
