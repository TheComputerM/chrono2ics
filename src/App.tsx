import * as ics from "ics";
import { createSignal } from "solid-js";
import { Center, Container, Stack } from "styled-system/jsx";
import { Button } from "./components/ui/button";
import { FormLabel } from "./components/ui/form-label";
import { Heading } from "./components/ui/heading";
import { Input } from "./components/ui/input";
import { Link } from "./components/ui/link";
import { Text } from "./components/ui/text";

interface ChronoSection {
  id: string;
  type: string;
  number: number;
  roomTime: string[];
}

async function fetchChronoTimetable(id: string) {
  const response = await fetch(
    `https://www.chrono.crux-bphc.com/api/timetable/${id}`,
  );
  const data = await response.json();
  return data as {
    name: string;
    sections: ChronoSection[];
  };
}

const dayIndexMap: Record<string, number> = {
  S: 0,
  M: 1,
  T: 2,
  W: 3,
  Th: 4,
  F: 5,
  Sa: 6,
};

/** Stores Date objects for every day in the next week starting from today */
const dayDefaultTimes = Array(7).fill(null);
const tempDate = new Date();
tempDate.setHours(0);
tempDate.setMinutes(0);
tempDate.setSeconds(0);
tempDate.setMilliseconds(0);
for (let i = 1; i <= 7; i++) {
  dayDefaultTimes[tempDate.getDay()] = new Date(tempDate);
  tempDate.setDate(tempDate.getDate() + 1);
}

function generateSectionEvent(section: ChronoSection) {
  return section.roomTime.map((info) => {
    const [course, classroom, day, slot] = info.split(":");

    const startDate = new Date(dayDefaultTimes[dayIndexMap[day]]);
    startDate.setHours(parseInt(slot) + 7);
    return {
      title: `${course} ${section.type}${section.number}`,
      location: classroom,
      recurrenceRule: "FREQ=WEEKLY",
      productId: "thecomputerm/chrono2ics",
      start: startDate.getTime(),
      duration: {
        hours: 1,
      },
    };
  });
}

function App() {
  /** the timetable slug id used in the url */
  const [timetableId, setTimetableId] = createSignal("");

  async function generate() {
    const timetable = await fetchChronoTimetable(timetableId());
    const events = timetable.sections.map(generateSectionEvent).flat();
    const { value } = ics.createEvents(events);
    const a = document.createElement("a");
    const url = window.URL.createObjectURL(
      new Blob([value!], { type: "text/ics" }),
    );
    a.setAttribute("download", `${timetable.name}.ics`);
    a.setAttribute("href", url);
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }

  return (
    <Center height="100svh">
      <Container>
        <Stack gap="6" align="center">
          <Heading
            as="h1"
            textStyle={{ sm: "6xl", base: "5xl" }}
            textAlign="center"
          >
            Chrono2ICS
          </Heading>
          <Stack gap="1.5" width={{ md: "sm" }}>
            <FormLabel>ChronoFactorem Timetable URL</FormLabel>
            <Input
              placeholder="chrono.crux-bphc.com/view/..."
              onChange={({ target }) =>
                setTimetableId(
                  target.value.substring(
                    target.value.lastIndexOf("/") + 1,
                    target.value.length,
                  ),
                )
              }
            />
          </Stack>
          <Button onClick={generate}>Generate ICS</Button>
          <Text color="fg.subtle" textAlign="center">
            The ICS file can be imported into popular calendar services such as{" "}
            <Link
              target="_blank"
              href="https://support.google.com/calendar/thread/3231927?hl=en&msgid=3236002"
            >
              Google
            </Link>
            ,{" "}
            <Link
              target="_blank"
              href="https://discussions.apple.com/thread/254625033?answerId=258646444022&sortBy=rank#258646444022"
            >
              iCalendar
            </Link>{" "}
            and{" "}
            <Link
              target="_blank"
              href="https://support.microsoft.com/en-us/office/import-calendars-into-outlook-8e8364e1-400e-4c0f-a573-fe76b5a2d379"
            >
              Outlook
            </Link>{" "}
            etc.
          </Text>
        </Stack>
      </Container>
    </Center>
  );
}

export default App;
