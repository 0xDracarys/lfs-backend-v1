
import React, { useState } from "react";
import { InputRequest } from "../lib/lfs-automation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface InputModalProps {
  request: (InputRequest & { placeholder?: string }) | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

const InputModal: React.FC<InputModalProps> = ({
  request,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [value, setValue] = useState<string>(request?.default || "");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (request?.required && !value) return;
    onSubmit(value);
    setValue("");
  };
  
  if (!request) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{request.message}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="py-4">
            {request.type === "confirm" ? (
              <div className="flex justify-center space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setValue("false");
                    onSubmit("false");
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  onClick={() => {
                    setValue("true");
                    onSubmit("true");
                  }}
                >
                  Confirm
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {request.description && (
                  <p className="text-sm text-gray-500">{request.description}</p>
                )}
                <Input
                  type={request.type === "password" ? "password" : "text"}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={request.placeholder || request.default || ""}
                  className="w-full"
                  autoFocus
                />
                {request.placeholder && (
                  <p className="text-xs text-gray-400">Example: {request.placeholder}</p>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            {request.type !== "confirm" && (
              <div className="flex justify-end space-x-2">
                {!request.required && (
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                )}
                <Button type="submit">Submit</Button>
              </div>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InputModal;
