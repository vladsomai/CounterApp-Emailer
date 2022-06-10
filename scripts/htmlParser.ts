import { Project } from "./projectType";
import { parse } from "node-html-parser";
import { ProjectDictionary } from "./projectType";

//This message has low priority - Warning -> class="text-warning"
//This message has high priority - Alert  -> class="text-danger"

export const parseHtmlFile = (
  htmlRawContent: string,
  projectDictionary: ProjectDictionary
): string => {
  const root = parse(htmlRawContent, {
    blockTextElements: {
      script: true, // keep text content when parsing
      noscript: true, // keep text content when parsing
      style: true, // keep text content when parsing
      pre: true, // keep text content when parsing
    },
  });

  let textToBeAddedForPriorityTag = "";
  let classToBeAddedForPriorityTag = "";

  switch (projectDictionary.issue) {
    case "temperature_limit":
      textToBeAddedForPriorityTag =
        "The limit temperature of 27 deg. C has been reached. Please check the air cooling systems and fans of the equipment.";
      classToBeAddedForPriorityTag = "text-danger";
      break;
    case "temperature_spike":
      textToBeAddedForPriorityTag =
        "A spike of 3 deg. C has been detected from the previous reading. Please check the air cooling systems and fans of the equipment";
      classToBeAddedForPriorityTag = "text-danger";
      break;
    case "limit":
      textToBeAddedForPriorityTag = "The adapter below has reached its contact limit, please consider taking the maintanance ASAP. This message has high priority - Alert";
      classToBeAddedForPriorityTag = "text-danger";
      break;
    case "warning":
      textToBeAddedForPriorityTag = "The adapter below has reached its contact warning, please consider scheduling the maintanance soon. This message has low priority - Warning";
      classToBeAddedForPriorityTag = "text-warning";
      break;

    default:
      textToBeAddedForPriorityTag =
        "If you receive this error, please contact your administrator!";
      classToBeAddedForPriorityTag = "test-danger";
      break;
  }

  root.getElementById("priorityLevelTag").innerHTML =
    textToBeAddedForPriorityTag;
  root
    .getElementById("priorityLevelTag")
    .classList.add(classToBeAddedForPriorityTag);

  root.getElementById("project_name").innerHTML =
    "Project name: " + projectDictionary.project.project_name;
  root.getElementById("adapter_code").innerHTML =
    "Adapter code: " + projectDictionary.project.adapter_code.toString();
  root.getElementById("fixture_type").innerHTML =
    "Fixture type: " + projectDictionary.project.fixture_type;
  root.getElementById("owner_email").innerHTML =
    "Owner email: " + projectDictionary.project.owner_email;
  root.getElementById("contacts").innerHTML =
    "Contacts:" + projectDictionary.project.contacts.toString();
  root.getElementById("contacts_limit").innerHTML =
    "Contacts limit: " + projectDictionary.project.contacts_limit.toString();
  root.getElementById("warning_at").innerHTML =
    "Warning at: " + projectDictionary.project.warning_at.toString();
  root.getElementById("resets").innerHTML =
    "Resets: " + projectDictionary.project.resets.toString();
  root.getElementById("temperature").innerHTML =
    "Temperature: " + projectDictionary.project.temperature.toString();
  root.getElementById("modified_by").innerHTML =
    "Modified by: " + projectDictionary.project.modified_by.toString();
  root.getElementById("last_update").innerHTML =
    "Last update: " + projectDictionary.project.last_update.toString();

  let parsedHtmlContent = root.toString();
  return parsedHtmlContent;
};
