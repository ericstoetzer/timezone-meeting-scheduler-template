import { DefineFunction, Schema, SlackFunction } from "deno-slack-sdk/mod.ts";

// Function definition
export const TimeZoneSchedulerFunction = DefineFunction({
  callback_id: "time_zone_scheduler",
  title: "Time Zone-Aware Meeting Scheduler",
  description:
    "Converts a proposed meeting time to the participant's time zone and calculates the end time.",
  source_file: "functions/timezone_scheduler_function.ts",
  input_parameters: {
    properties: {
      meeting_time: {
        type: Schema.types.string,
        description:
          "Proposed meeting time (e.g., '2023-08-12T14:30:00Z' or 'Aug 12, 2023, 2:30:00 PM')",
      },
      user_timezone: {
        type: Schema.types.string,
        description:
          "User's local date and time with timezone (e.g., 'August 14th, 2024 at 11:06 PM GMT+2')",
      },
      from_timezone: {
        type: Schema.types.string,
        description:
          "Time zone of the user who proposed the meeting (e.g., 'America/New_York')",
      },
      target_timezone: {
        type: Schema.types.string,
        description:
          "Time zone of the meeting participant (e.g., 'Europe/London')",
      },
      duration_minutes: {
        type: Schema.types.number,
        description:
          "Duration of the meeting in minutes (e.g., '30'",
      },
    },
    required: [
      "meeting_time",
      "user_timezone",
      "from_timezone",
      "target_timezone",
      "duration_minutes",
    ],
  },
  output_parameters: {
    properties: {
      readable_time_origin: {
        type: Schema.types.string,
        description: "Readable meeting time in the user's time zone",
      },
      readable_time_participant: {
        type: Schema.types.string,
        description: "Readable meeting time in the participant's time zone",
      },
      calendar_meeting_time: {
        type: Schema.slack.types.timestamp,
        description: "Meeting time in the user's timezone",
      },
      calendar_end_time: {
        type: Schema.slack.types.timestamp,
        description: "Meeting end time in the user's timezone",
      },
    },
    required: [
      "readable_time_origin",
      "readable_time_participant",
      "calendar_meeting_time",
      "calendar_end_time",
    ],
  },
});

export default SlackFunction(
  "SlackFunction(TimeZoneSchedulerFunction, ...)", // CHANGE THIS 
  async ({ inputs }) => {
    /* YOU CAN DECLARE THE INPUTS TOGETHER HERE*/

    let readableTimeOrigin: string | null = null;
    let readableTimeParticipant: string | null = null;
    let calendarMeetingTime: number | null = null;
    let calendarEndTime: number | null = null;

    try {
      // Step 1: Correctly format the meeting time for API usage
      const formattedMeetingTime = formatDateTimeForAPI(
        //ADD THE meeting_time INPUT,
      );

      const meetingConversionResult = await convertTimeZone(
        // ADD THE from_timezone INPUT,
        formattedMeetingTime,
        // ADD THE target_timezone INPUT,
      );

      if (
        !meetingConversionResult ||
        !meetingConversionResult.conversionResult
      ) {
        throw new Error("Invalid DateTime format from API.");
      }

      // Step 2: Convert meeting_time from from_timezone to user timezone
      const calendarConversionResult = await convertTimeZone(
        // ADD THE from_timezone INPUT,
        formattedMeetingTime,
        // ADD THE user_timezone INPUT,
      );

      if (
        !calendarConversionResult || !calendarConversionResult.conversionResult
      ) {
        throw new Error("Invalid DateTime format from API.");
      }

      // Extract the calendar meeting time in user's timezone
      const userTimeZoneDate = new Date(
        calendarConversionResult.conversionResult.dateTime,
      );
      calendarMeetingTime = Math.floor(userTimeZoneDate.getTime() / 1000);

      // Step 4: Calculate readable times
      const originTime = new Date(/*ADD THE meeting_time INPUT*/);
      readableTimeOrigin = originTime.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      const participantDateTime = new Date(
        meetingConversionResult.conversionResult.dateTime,
      );
      readableTimeParticipant = participantDateTime.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });

      // Step 5: Calculate end time for user
      const endTimeUser = new Date(
        userTimeZoneDate.getTime() + /*ADD THE duration_minutes INPUT*/ * 60000,
      );
      calendarEndTime = Math.floor(endTimeUser.getTime() / 1000);
    } catch (error) {
      return {
        error: `Error converting time: ${error.message}`,
      };
    }

    return {
      outputs: {
        readable_time_origin: /*ADD THE OUTPUT VALUE*/,
        readable_time_participant: /*ADD THE OUTPUT VALUE*/,
        calendar_meeting_time: /*ADD THE OUTPUT VALUE*/,
        calendar_end_time: /*ADD THE OUTPUT VALUE*/,
      },
    };
  },
);
