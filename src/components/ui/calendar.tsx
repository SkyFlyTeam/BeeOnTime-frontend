import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, DayPickerDefaultProps, DayPickerMultipleProps, DayPickerRangeProps, DayPickerSingleProps, Matcher, Modifiers } from "react-day-picker";
import { cn } from "../../lib/utils";
import { buttonVariants } from "./button";
import { pt } from 'date-fns/locale'; // Importando o locale para o português
import type { ClassNames, ModifiersStyles } from "react-day-picker";

type DayPickerProps = DayPickerDefaultProps | DayPickerSingleProps | DayPickerMultipleProps | DayPickerRangeProps;

type CalendarComponentProps = DayPickerProps & {
  holidays?: Date[];
};

function isHoliday(date: Date, holidays: Date[]): boolean {
  return holidays.some(
    (holiday) =>
      holiday.getDate() === date.getDate() &&
      holiday.getMonth() === date.getMonth() &&
      holiday.getFullYear() === date.getFullYear()
  );
}

function normalizeModifiers(mods?: Partial<Modifiers>): Modifiers {
  return {
    holiday: [],
    outside: [],
    disabled: [],
    selected: [],
    hidden: [],
    today: [],
    range_start: [],
    range_end: [],
    range_middle: [],
    ...(mods || {}),
  };
}

function Calendar({
  holidays = [],
  className,
  classNames,
  modifiers,
  showOutsideDays = true,
  ...props
}: CalendarComponentProps) {
  const today = new Date();

  const userMods = modifiers as Partial<Modifiers> | undefined;
  const userModsNormalized = normalizeModifiers(userMods);

  const holidayModifier: Modifiers["holiday"] | undefined =
  holidays.length > 0
    ? [(date: Date) => isHoliday(date, holidays)]
    : undefined;

  const combinedModifiers: Modifiers = {
    ...userModsNormalized,
    ...(holidayModifier ? { holiday: holidayModifier } : {}),
  };

  const combinedClassNames = {
    months: "flex flex-col sm:flex-row space-y-2 sm:space-x-4 sm:space-y-0 ",
    month: "space-y-2",
    caption: "flex justify-center pt-1 relative items-center text-primary mx-auto",
    caption_label: "text-sm font-medium capitalize",
    nav: "space-x-1 flex items-center",
    nav_button: cn(
      buttonVariants({ variant: "outline" }),
      "h-2 w-2 bg-transparent p-0 opacity-50 hover:opacity-100"
    ),
    nav_button_previous: "absolute md:left-9 left-2 ghost",
    nav_button_next: "absolute md:right-9 right-2 ghost",
    table: "w-full max-w-lg",
    head_row: "flex space-x-4",
    head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] capitalize",
    row: "flex w-full mt-0.1 space-x-4 space-y-0.0125",
    cell: "h-9 w-9 text-center text-sm p-0 relative",
    day: cn(
      buttonVariants({ variant: "ghost" }),
      "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
    ),
    day_range_end: "day-range-end",
    day_selected:
      "bg-red-50 text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
    day_today: "bg-accent text-accent-foreground",
    day_outside:
      "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
    day_disabled: "text-muted-foreground opacity-50",
    day_range_middle:
      "aria-selected:bg-accent aria-selected:text-accent-foreground",
    day_hidden: "invisible",
    ...classNames,
  };

  return (
    <div className="flex justify-center"> 
      <DayPicker
        locale={pt}  
        showOutsideDays={showOutsideDays}
        className={cn("p-3 border-none", className)} 
        fromDate={today}
        classNames={combinedClassNames}
        modifiersClassNames={{
          holiday: "bg-[#D61818] text-white", 
        }}
        modifiers={combinedModifiers}
        components={{
          IconLeft: ({ className, ...props }) => (
            <ChevronLeft className={cn("!w-[1.5rem] !h-[1.5rem]", className)} {...props} />
          ),
          IconRight: ({ className, ...props }) => (
            <ChevronRight className={cn("!w-[1.5rem] !h-[1.5rem]", className)} {...props} />
          ),
        }}
        {...props}
      />
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
