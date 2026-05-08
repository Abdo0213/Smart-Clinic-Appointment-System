"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string;
  fromPlaceholder?: string;
  toPlaceholder?: string;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  className,
  fromPlaceholder = "From",
  toPlaceholder = "To",
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger render={<Button variant="outline" id="date" />}>
          <CalendarIcon className="mr-2 size-4" />
          {dateRange?.from ? (
            dateRange.to ? (
              <>
                {format(dateRange.from, "LLL d, y")} -{" "}
                {format(dateRange.to, "LLL d, y")}
              </>
            ) : (
              format(dateRange.from, "LLL d, y")
            )
          ) : (
            <span>{fromPlaceholder}</span>
          )}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
