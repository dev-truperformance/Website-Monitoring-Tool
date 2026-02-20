import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

interface MonitorData {
  url: string;
  type: string;
  interval: string;
}

// Validation schema
const validationSchema = Yup.object().shape({
  url: Yup.string()
    .required('URL is required')
    .url('Please enter a valid URL')
    .matches(/^https?:\/\/.+/, 'URL must start with http:// or https://'),
  type: Yup.string()
    .required('Type is required')
    .oneOf(['http', 'ping', 'port'], 'Invalid type selected'),
  interval: Yup.string()
    .required('Interval is required')
    .oneOf(['30 sec','1 min', '5 min', '10 min', '30 min', '1 hr'], 'Invalid interval selected')
});

interface AddMonitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMonitor: (monitor: MonitorData) => void;
}

export default function AddMonitorModal({ isOpen, onClose, onAddMonitor }: AddMonitorModalProps) {
  const formik = useFormik({
    initialValues: {
      url: '',
      type: 'http',
      interval: '5 min'
    },
    validationSchema,
    onSubmit: (values) => {
      onAddMonitor(values);
      formik.resetForm();
      onClose();
    },
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Monitor</DialogTitle>
          <DialogDescription>
            Add a new monitor to track your website or service uptime.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">URL</Label>
            <Input
              type="url"
              name="url"
              value={formik.values.url}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="https://example.com"
            />
            {formik.touched.url && formik.errors.url && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.url}</div>
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">Type</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {formik.values.type === 'http' ? 'HTTP' : formik.values.type === 'ping' ? 'Ping' : 'Port'}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px]">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => formik.setFieldValue('type', 'http')}>
                    HTTP
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => formik.setFieldValue('type', 'ping')}>
                    Ping
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => formik.setFieldValue('type', 'port')}>
                    Port
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {formik.touched.type && formik.errors.type && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.type}</div>
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium text-foreground mb-2">Check Interval</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  {formik.values.interval}
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] min-w-[200px]">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => formik.setFieldValue('interval', '30 sec')}>
                    30 sec
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => formik.setFieldValue('interval', '1 min')}>
                    1 minute
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => formik.setFieldValue('interval', '5 min')}>
                    5 minutes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => formik.setFieldValue('interval', '10 min')}>
                    10 minutes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => formik.setFieldValue('interval', '30 min')}>
                    30 minutes
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => formik.setFieldValue('interval', '1 hr')}>
                    1 hour
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            {formik.touched.interval && formik.errors.interval && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.interval}</div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit"
            onClick={(e) => {
              e.preventDefault();
              formik.handleSubmit();
            }}
            className="dark:text-white"
          >
            Add Monitor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
