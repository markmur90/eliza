var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/dedent/dist/dedent.js
var require_dedent = __commonJS({
  "../../node_modules/dedent/dist/dedent.js"(exports, module) {
    "use strict";
    function dedent3(strings) {
      var raw = void 0;
      if (typeof strings === "string") {
        raw = [strings];
      } else {
        raw = strings.raw;
      }
      var result = "";
      for (var i2 = 0; i2 < raw.length; i2++) {
        result += raw[i2].replace(/\\\n[ \t]*/g, "").replace(/\\`/g, "`");
        if (i2 < (arguments.length <= 1 ? 0 : arguments.length - 1)) {
          result += arguments.length <= i2 + 1 ? void 0 : arguments[i2 + 1];
        }
      }
      var lines = result.split("\n");
      var mindent = null;
      lines.forEach(function(l) {
        var m = l.match(/^(\s+)\S+/);
        if (m) {
          var indent = m[1].length;
          if (!mindent) {
            mindent = indent;
          } else {
            mindent = Math.min(mindent, indent);
          }
        }
      });
      if (mindent !== null) {
        result = lines.map(function(l) {
          return l[0] === " " ? l.slice(mindent) : l;
        }).join("\n");
      }
      result = result.trim();
      return result.replace(/\\n/g, "\n");
    }
    if (typeof module !== "undefined") {
      module.exports = dedent3;
    }
  }
});

// src/index.ts
import {
  asUUID,
  ChannelType as ChannelType9,
  composePromptFromState as composePromptFromState9,
  ContentType,
  createUniqueUuid as createUniqueUuid3,
  EventType,
  imageDescriptionTemplate,
  logger as logger18,
  messageHandlerTemplate,
  ModelType as ModelType13,
  parseKeyValueXml,
  postCreationTemplate,
  Role as Role2,
  shouldRespondTemplate,
  truncateToCompleteSentence
} from "@elizaos/core";

// ../../node_modules/uuid/dist/esm/stringify.js
var byteToHex = [];
for (let i2 = 0; i2 < 256; ++i2) {
  byteToHex.push((i2 + 256).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

// ../../node_modules/uuid/dist/esm/rng.js
import { randomFillSync } from "crypto";
var rnds8Pool = new Uint8Array(256);
var poolPtr = rnds8Pool.length;
function rng() {
  if (poolPtr > rnds8Pool.length - 16) {
    randomFillSync(rnds8Pool);
    poolPtr = 0;
  }
  return rnds8Pool.slice(poolPtr, poolPtr += 16);
}

// ../../node_modules/uuid/dist/esm/native.js
import { randomUUID } from "crypto";
var native_default = { randomUUID };

// ../../node_modules/uuid/dist/esm/v4.js
function v4(options, buf, offset) {
  if (native_default.randomUUID && !buf && !options) {
    return native_default.randomUUID();
  }
  options = options || {};
  const rnds = options.random ?? options.rng?.() ?? rng();
  if (rnds.length < 16) {
    throw new Error("Random bytes length must be >= 16");
  }
  rnds[6] = rnds[6] & 15 | 64;
  rnds[8] = rnds[8] & 63 | 128;
  if (buf) {
    offset = offset || 0;
    if (offset < 0 || offset + 16 > buf.length) {
      throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
    }
    for (let i2 = 0; i2 < 16; ++i2) {
      buf[offset + i2] = rnds[i2];
    }
    return buf;
  }
  return unsafeStringify(rnds);
}
var v4_default = v4;

// src/actions/choice.ts
import {
  composePrompt,
  getUserServerRole,
  logger,
  ModelType,
  parseJSONObjectFromText
} from "@elizaos/core";
var optionExtractionTemplate = `# Task: Extract selected task and option from user message

# Available Tasks:
{{#each tasks}}
Task ID: {{taskId}} - {{name}}
Available options:
{{#each options}}
- {{name}}: {{description}}
{{/each}}
- ABORT: Cancel this task

{{/each}}

# Recent Messages:
{{recentMessages}}

# Instructions:
1. Review the user's message and identify which task and option they are selecting
2. Match against the available tasks and their options, including ABORT
3. Return the task ID (shortened UUID) and selected option name exactly as listed above
4. If no clear selection is made, return null for both fields

Return in JSON format:
\`\`\`json
{
  "taskId": "string" | null,
  "selectedOption": "OPTION_NAME" | null
}
\`\`\`

Make sure to include the \`\`\`json\`\`\` tags around the JSON object.`;
var choiceAction = {
  name: "CHOOSE_OPTION",
  similes: ["SELECT_OPTION", "SELECT", "PICK", "CHOOSE"],
  description: "Selects an option for a pending task that has multiple options",
  validate: async (runtime, message, state) => {
    if (!state) {
      logger.error("State is required for validating the action");
      throw new Error("State is required for validating the action");
    }
    const room = state.data.room ?? await runtime.getRoom(message.roomId);
    if (!room || !room.serverId) {
      return false;
    }
    const userRole = await getUserServerRole(runtime, message.entityId, room.serverId);
    if (userRole !== "OWNER" && userRole !== "ADMIN") {
      return false;
    }
    try {
      const pendingTasks = await runtime.getTasks({
        roomId: message.roomId,
        tags: ["AWAITING_CHOICE"]
      });
      const room2 = state.data.room ?? await runtime.getRoom(message.roomId);
      const userRole2 = await getUserServerRole(runtime, message.entityId, room2.serverId);
      if (userRole2 !== "OWNER" && userRole2 !== "ADMIN") {
        return false;
      }
      return pendingTasks && pendingTasks.length > 0 && pendingTasks.some((task) => task.metadata?.options);
    } catch (error) {
      logger.error("Error validating choice action:", error);
      return false;
    }
  },
  handler: async (runtime, message, _state, _options, callback, _responses) => {
    const pendingTasks = await runtime.getTasks({
      roomId: message.roomId,
      tags: ["AWAITING_CHOICE"]
    });
    if (!pendingTasks?.length) {
      throw new Error("No pending tasks with options found");
    }
    const tasksWithOptions = pendingTasks.filter((task) => task.metadata?.options);
    if (!tasksWithOptions.length) {
      throw new Error("No tasks currently have options to select from.");
    }
    const formattedTasks = tasksWithOptions.map((task) => {
      const shortId = task.id?.substring(0, 8);
      return {
        taskId: shortId,
        fullId: task.id,
        name: task.name,
        options: task.metadata?.options?.map((opt) => ({
          name: typeof opt === "string" ? opt : opt.name,
          description: typeof opt === "string" ? opt : opt.description || opt.name
        }))
      };
    });
    const tasksString = formattedTasks.map((task) => {
      return `Task ID: ${task.taskId} - ${task.name}
Available options:
${task.options?.map((opt) => `- ${opt.name}: ${opt.description}`).join("\n")}`;
    }).join("\n");
    const prompt = composePrompt({
      state: {
        tasks: tasksString,
        recentMessages: message.content.text || ""
      },
      template: optionExtractionTemplate
    });
    const result = await runtime.useModel(ModelType.TEXT_SMALL, {
      prompt,
      stopSequences: []
    });
    const parsed = parseJSONObjectFromText(result);
    const { taskId, selectedOption } = parsed;
    if (taskId && selectedOption) {
      const taskMap = new Map(formattedTasks.map((task) => [task.taskId, task]));
      const taskInfo = taskMap.get(taskId);
      if (!taskInfo) {
        await callback?.({
          text: `Could not find a task matching ID: ${taskId}. Please try again.`,
          actions: ["SELECT_OPTION_ERROR"],
          source: message.content.source
        });
        return;
      }
      const selectedTask = tasksWithOptions.find((task) => task.id === taskInfo.fullId);
      if (!selectedTask) {
        await callback?.({
          text: "Error locating the selected task. Please try again.",
          actions: ["SELECT_OPTION_ERROR"],
          source: message.content.source
        });
        return;
      }
      if (selectedOption === "ABORT") {
        if (!selectedTask?.id) {
          await callback?.({
            text: "Error locating the selected task. Please try again.",
            actions: ["SELECT_OPTION_ERROR"],
            source: message.content.source
          });
          return;
        }
        await runtime.deleteTask(selectedTask.id);
        await callback?.({
          text: `Task "${selectedTask.name}" has been cancelled.`,
          actions: ["CHOOSE_OPTION_CANCELLED"],
          source: message.content.source
        });
        return;
      }
      try {
        const taskWorker = runtime.getTaskWorker(selectedTask.name);
        await taskWorker?.execute(runtime, { option: selectedOption }, selectedTask);
        await callback?.({
          text: `Selected option: ${selectedOption} for task: ${selectedTask.name}`,
          actions: ["CHOOSE_OPTION"],
          source: message.content.source
        });
        return;
      } catch (error) {
        logger.error("Error executing task with option:", error);
        await callback?.({
          text: "There was an error processing your selection.",
          actions: ["SELECT_OPTION_ERROR"],
          source: message.content.source
        });
        return;
      }
    }
    let optionsText = "Please select a valid option from one of these tasks:\n\n";
    tasksWithOptions.forEach((task) => {
      const shortId = task.id?.substring(0, 8);
      optionsText += `**${task.name}** (ID: ${shortId}):
`;
      const options = task.metadata?.options?.map(
        (opt) => typeof opt === "string" ? opt : opt.name
      );
      options?.push("ABORT");
      optionsText += options?.map((opt) => `- ${opt}`).join("\n");
      optionsText += "\n\n";
    });
    await callback?.({
      text: optionsText,
      actions: ["SELECT_OPTION_INVALID"],
      source: message.content.source
    });
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "post"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Selected option: post for task: Confirm Twitter Post",
          actions: ["CHOOSE_OPTION"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "I choose cancel"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Selected option: cancel for task: Confirm Twitter Post",
          actions: ["CHOOSE_OPTION"]
        }
      }
    ]
  ]
};

// src/actions/followRoom.ts
import {
  booleanFooter,
  composePromptFromState,
  logger as logger2,
  ModelType as ModelType2
} from "@elizaos/core";
var shouldFollowTemplate = `# Task: Decide if {{agentName}} should start following this room, i.e. eagerly participating without explicit mentions.

{{recentMessages}}

Should {{agentName}} start following this room, eagerly participating without explicit mentions?
Respond with YES if:
- The user has directly asked {{agentName}} to follow the conversation or participate more actively
- The conversation topic is highly engaging and {{agentName}}'s input would add significant value
- {{agentName}} has unique insights to contribute and the users seem receptive

Otherwise, respond with NO.
${booleanFooter}`;
var followRoomAction = {
  name: "FOLLOW_ROOM",
  similes: ["FOLLOW_CHAT", "FOLLOW_CHANNEL", "FOLLOW_CONVERSATION", "FOLLOW_THREAD"],
  description: "Start following this channel with great interest, chiming in without needing to be explicitly mentioned. Only do this if explicitly asked to.",
  validate: async (runtime, message) => {
    const keywords = ["follow", "participate", "engage", "listen", "take interest", "join"];
    if (!keywords.some((keyword) => message.content.text?.toLowerCase().includes(keyword))) {
      return false;
    }
    const roomId = message.roomId;
    const roomState = await runtime.getParticipantUserState(roomId, runtime.agentId);
    return roomState !== "FOLLOWED" && roomState !== "MUTED";
  },
  handler: async (runtime, message, state, _options, _callback, _responses) => {
    if (!state) {
      logger2.error("State is required for followRoomAction");
      throw new Error("State is required for followRoomAction");
    }
    async function _shouldFollow(state2) {
      const shouldFollowPrompt = composePromptFromState({
        state: state2,
        template: shouldFollowTemplate
        // Define this template separately
      });
      const response = await runtime.useModel(ModelType2.TEXT_SMALL, {
        runtime,
        prompt: shouldFollowPrompt,
        stopSequences: []
      });
      const cleanedResponse = response.trim().toLowerCase();
      if (cleanedResponse === "true" || cleanedResponse === "yes" || cleanedResponse === "y" || cleanedResponse.includes("true") || cleanedResponse.includes("yes")) {
        await runtime.createMemory(
          {
            entityId: message.entityId,
            agentId: message.agentId,
            roomId: message.roomId,
            content: {
              source: message.content.source,
              thought: "I will now follow this room and chime in",
              actions: ["FOLLOW_ROOM_STARTED"]
            },
            metadata: {
              type: "FOLLOW_ROOM"
            }
          },
          "messages"
        );
        return true;
      }
      if (cleanedResponse === "false" || cleanedResponse === "no" || cleanedResponse === "n" || cleanedResponse.includes("false") || cleanedResponse.includes("no")) {
        await runtime.createMemory(
          {
            entityId: message.entityId,
            agentId: message.agentId,
            roomId: message.roomId,
            content: {
              source: message.content.source,
              thought: "I decided to not follow this room",
              actions: ["FOLLOW_ROOM_FAILED"]
            },
            metadata: {
              type: "FOLLOW_ROOM"
            }
          },
          "messages"
        );
        return false;
      }
      logger2.warn(`Unclear boolean response: ${response}, defaulting to false`);
      return false;
    }
    if (await _shouldFollow(state)) {
      await runtime.setParticipantUserState(message.roomId, runtime.agentId, "FOLLOWED");
    }
    const room = state.data.room ?? await runtime.getRoom(message.roomId);
    await runtime.createMemory(
      {
        entityId: message.entityId,
        agentId: message.agentId,
        roomId: message.roomId,
        content: {
          thought: `I followed the room ${room.name}`,
          actions: ["FOLLOW_ROOM_START"]
        }
      },
      "messages"
    );
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "hey {{name2}} follow this channel"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Sure, I will now follow this room and chime in",
          actions: ["FOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name3}}, please start participating in discussions in this channel"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "Got it",
          actions: ["FOLLOW_ROOM"]
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "I'm struggling with the new database migration"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "well you did back up your data first right"
        }
      }
    ],
    [
      {
        name: "{{name2}}",
        content: {
          text: "yeah i like your idea"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "hey {{name3}} can you follow this convo"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "Sure thing, I'm on it",
          actions: ["FOLLOW_ROOM"]
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "actually, unfollow it"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "Haha, okay no problem",
          actions: ["UNFOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name2}} stay in this chat pls"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "you got it, i'm here",
          actions: ["FOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "FOLLOW THIS CHAT {{name3}}"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "I'M ON IT",
          actions: ["FOLLOW_ROOM"]
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "CAKE SHORTAGE ANYONE"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "WHAT WHERE'S THE CAKE AT"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name2}} folo this covo"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "kk i'm following",
          actions: ["FOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name2}}",
        content: {
          text: "Do machines have consciousness"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Deep question, no clear answer yet"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Depends on how we define consciousness"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name2}}, monitor this convo please"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "On it",
          actions: ["FOLLOW_ROOM"]
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "Please engage in our discussion {{name2}}"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Gladly, I'm here to participate",
          actions: ["FOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "PLS follow this convo {{name3}}"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "I'm in, let's do this",
          actions: ["FOLLOW_ROOM"]
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "I LIKE TURTLES"
        }
      }
    ],
    [
      {
        name: "{{name2}}",
        content: {
          text: "beach day tmrw who down"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "wish i could but gotta work"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "hey {{name3}} follow this chat"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "sure",
          actions: ["FOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name3}}, partake in our discourse henceforth"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "I shall eagerly engage, good sir",
          actions: ["FOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name2}}",
        content: {
          text: "wuts ur fav clr"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "blu cuz calmmm"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "hey respond to everything in this channel {{name3}}"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "k",
          actions: ["FOLLOW_ROOM"]
        }
      }
    ]
  ]
};

// src/actions/ignore.ts
var ignoreAction = {
  name: "IGNORE",
  similes: ["STOP_TALKING", "STOP_CHATTING", "STOP_CONVERSATION"],
  validate: async (_runtime, _message) => {
    return true;
  },
  description: "Call this action if ignoring the user. If the user is aggressive, creepy or is finished with the conversation, use this action. Or, if both you and the user have already said goodbye, use this action instead of saying bye again. Use IGNORE any time the conversation has naturally ended. Do not use IGNORE if the user has engaged directly, or if something went wrong an you need to tell them. Only ignore if the user should be ignored.",
  handler: async (_runtime, _message, _state, _options, callback, responses) => {
    if (callback && responses?.[0]?.content) {
      await callback(responses[0].content);
    }
    return true;
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: { text: "Go screw yourself" }
      },
      {
        name: "{{name2}}",
        content: { text: "", actions: ["IGNORE"] }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: { text: "Shut up, bot" }
      },
      {
        name: "{{name2}}",
        content: { text: "", actions: ["IGNORE"] }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: { text: "Got any investment advice" }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Uh, don\u2019t let the volatility sway your long-term strategy"
        }
      },
      {
        name: "{{name1}}",
        content: { text: "Wise words I think" }
      },
      {
        name: "{{name1}}",
        content: { text: "I gotta run, talk to you later" }
      },
      {
        name: "{{name2}}",
        content: { text: "See ya" }
      },
      { name: "{{name1}}", content: { text: "" }, actions: ["IGNORE"] }
    ],
    [
      {
        name: "{{name1}}",
        content: { text: "Gotta go" }
      },
      {
        name: "{{name2}}",
        content: { text: "Okay, talk to you later" }
      },
      {
        name: "{{name1}}",
        content: { text: "Cya" }
      },
      {
        name: "{{name2}}",
        content: { text: "", actions: ["IGNORE"] }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: { text: "bye" }
      },
      {
        name: "{{name2}}",
        content: { text: "cya" }
      },
      {
        name: "{{name1}}",
        content: { text: "", actions: ["IGNORE"] }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Who added this stupid bot to the chat"
        }
      },
      {
        name: "{{name2}}",
        content: { text: "Sorry, am I being annoying" }
      },
      {
        name: "{{name1}}",
        content: { text: "Yeah" }
      },
      {
        name: "{{name1}}",
        content: { text: "PLEASE shut up" }
      },
      { name: "{{name2}}", content: { text: "", actions: ["IGNORE"] } }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "ur so dumb"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "",
          actions: ["IGNORE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "later nerd"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "bye"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: ""
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "",
          actions: ["IGNORE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "wanna cyber"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "thats inappropriate",
          actions: ["IGNORE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Im out ttyl"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "cya"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "",
          actions: ["IGNORE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "u there"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "yes how can I help"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "k nvm figured it out"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "",
          actions: ["IGNORE"]
        }
      }
    ]
  ]
};

// src/actions/muteRoom.ts
import {
  booleanFooter as booleanFooter2,
  composePromptFromState as composePromptFromState2,
  logger as logger3,
  ModelType as ModelType3
} from "@elizaos/core";
var shouldMuteTemplate = `# Task: Decide if {{agentName}} should mute this room and stop responding unless explicitly mentioned.

{{recentMessages}}

Should {{agentName}} mute this room and stop responding unless explicitly mentioned?

Respond with YES if:
- The user is being aggressive, rude, or inappropriate
- The user has directly asked {{agentName}} to stop responding or be quiet
- {{agentName}}'s responses are not well-received or are annoying the user(s)

Otherwise, respond with NO.
${booleanFooter2}`;
var muteRoomAction = {
  name: "MUTE_ROOM",
  similes: ["MUTE_CHAT", "MUTE_CONVERSATION", "MUTE_ROOM", "MUTE_THREAD", "MUTE_CHANNEL"],
  description: "Mutes a room, ignoring all messages unless explicitly mentioned. Only do this if explicitly asked to, or if you're annoying people.",
  validate: async (runtime, message) => {
    const roomId = message.roomId;
    const roomState = await runtime.getParticipantUserState(roomId, runtime.agentId);
    return roomState !== "MUTED";
  },
  handler: async (runtime, message, state, _options, _callback, _responses) => {
    if (!state) {
      logger3.error("State is required for muting a room");
      throw new Error("State is required for muting a room");
    }
    async function _shouldMute(state2) {
      const shouldMutePrompt = composePromptFromState2({
        state: state2,
        template: shouldMuteTemplate
        // Define this template separately
      });
      const response = await runtime.useModel(ModelType3.TEXT_SMALL, {
        runtime,
        prompt: shouldMutePrompt,
        stopSequences: []
      });
      const cleanedResponse = response.trim().toLowerCase();
      if (cleanedResponse === "true" || cleanedResponse === "yes" || cleanedResponse === "y" || cleanedResponse.includes("true") || cleanedResponse.includes("yes")) {
        await runtime.createMemory(
          {
            entityId: message.entityId,
            agentId: message.agentId,
            roomId: message.roomId,
            content: {
              source: message.content.source,
              thought: "I will now mute this room",
              actions: ["MUTE_ROOM_STARTED"]
            },
            metadata: {
              type: "MUTE_ROOM"
            }
          },
          "messages"
        );
        return true;
      }
      if (cleanedResponse === "false" || cleanedResponse === "no" || cleanedResponse === "n" || cleanedResponse.includes("false") || cleanedResponse.includes("no")) {
        await runtime.createMemory(
          {
            entityId: message.entityId,
            agentId: message.agentId,
            roomId: message.roomId,
            content: {
              source: message.content.source,
              thought: "I decided to not mute this room",
              actions: ["MUTE_ROOM_FAILED"]
            },
            metadata: {
              type: "MUTE_ROOM"
            }
          },
          "messages"
        );
      }
      logger3.warn(`Unclear boolean response: ${response}, defaulting to false`);
      return false;
    }
    if (await _shouldMute(state)) {
      await runtime.setParticipantUserState(message.roomId, runtime.agentId, "MUTED");
    }
    const room = state.data.room ?? await runtime.getRoom(message.roomId);
    await runtime.createMemory(
      {
        entityId: message.entityId,
        agentId: message.agentId,
        roomId: message.roomId,
        content: {
          thought: `I muted the room ${room.name}`,
          actions: ["MUTE_ROOM_START"]
        }
      },
      "messages"
    );
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name3}}, please mute this channel. No need to respond here for now."
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "Got it",
          actions: ["MUTE_ROOM"]
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "@{{name1}} we could really use your input on this"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name3}}, please mute this channel for the time being"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "Understood",
          actions: ["MUTE_ROOM"]
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Hey what do you think about this new design"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "",
          actions: ["IGNORE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name2}} plz mute this room"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "np going silent",
          actions: ["MUTE_ROOM"]
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "whos going to the webxr meetup in an hour btw"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "",
          actions: ["IGNORE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "too many messages here {{name2}}"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "my bad ill mute",
          actions: ["MUTE_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "yo {{name2}} dont talk in here"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "sry",
          actions: ["MUTE_ROOM"]
        }
      }
    ]
  ]
};

// src/actions/none.ts
var noneAction = {
  name: "NONE",
  similes: ["NO_ACTION", "NO_RESPONSE", "NO_REACTION"],
  validate: async (_runtime, _message) => {
    return true;
  },
  description: "Respond but perform no additional action. This is the default if the agent is speaking and not doing anything additional.",
  handler: async (_runtime, _message) => {
    return true;
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: { text: "Hey whats up" }
      },
      {
        name: "{{name2}}",
        content: { text: "oh hey", actions: ["NONE"] }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "did u see some faster whisper just came out"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "yeah but its a pain to get into node.js",
          actions: ["NONE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "the things that were funny 6 months ago are very cringe now",
          actions: ["NONE"]
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "lol true",
          actions: ["NONE"]
        }
      },
      {
        name: "{{name1}}",
        content: { text: "too real haha", actions: ["NONE"] }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: { text: "gotta run", actions: ["NONE"] }
      },
      {
        name: "{{name2}}",
        content: { text: "Okay, ttyl", actions: ["NONE"] }
      },
      {
        name: "{{name1}}",
        content: { text: "", actions: ["IGNORE"] }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: { text: "heyyyyyy", actions: ["NONE"] }
      },
      {
        name: "{{name2}}",
        content: { text: "whats up long time no see" }
      },
      {
        name: "{{name1}}",
        content: {
          text: "chillin man. playing lots of fortnite. what about you",
          actions: ["NONE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: { text: "u think aliens are real", actions: ["NONE"] }
      },
      {
        name: "{{name2}}",
        content: { text: "ya obviously", actions: ["NONE"] }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: { text: "drop a joke on me", actions: ["NONE"] }
      },
      {
        name: "{{name2}}",
        content: {
          text: "why dont scientists trust atoms cuz they make up everything lmao",
          actions: ["NONE"]
        }
      },
      {
        name: "{{name1}}",
        content: { text: "haha good one", actions: ["NONE"] }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "hows the weather where ur at",
          actions: ["NONE"]
        }
      },
      {
        name: "{{name2}}",
        content: { text: "beautiful all week", actions: ["NONE"] }
      }
    ]
  ]
};

// src/actions/reply.ts
import {
  composePromptFromState as composePromptFromState3,
  ModelType as ModelType4
} from "@elizaos/core";
var replyTemplate = `# Task: Generate dialog for the character {{agentName}}.
{{providers}}
# Instructions: Write the next message for {{agentName}}.
"thought" should be a short description of what the agent is thinking about and planning.
"message" should be the next message for {{agentName}} which they will send to the conversation.

Response format should be formatted in a valid JSON block like this:
\`\`\`json
{
    "thought": "<string>",
    "message": "<string>"
}
\`\`\`

Your response should include the valid JSON block and nothing else.`;
var replyAction = {
  name: "REPLY",
  similes: ["GREET", "REPLY_TO_MESSAGE", "SEND_REPLY", "RESPOND", "RESPONSE"],
  description: "Replies to the current conversation with the text from the generated message. Default if the agent is responding with a message and no other action. Use REPLY at the beginning of a chain of actions as an acknowledgement, and at the end of a chain of actions as a final response.",
  validate: async (_runtime) => {
    return true;
  },
  handler: async (runtime, message, state, _options, callback, responses) => {
    const allProviders = responses?.flatMap((res) => res.content?.providers ?? []) ?? [];
    state = await runtime.composeState(message, [...allProviders ?? [], "RECENT_MESSAGES"]);
    const prompt = composePromptFromState3({
      state,
      template: replyTemplate
    });
    const response = await runtime.useModel(ModelType4.OBJECT_LARGE, {
      prompt
    });
    const responseContent = {
      thought: response.thought,
      text: response.message || "",
      actions: ["REPLY"]
    };
    await callback(responseContent);
    return true;
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Hello there!"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Hi! How can I help you today?",
          actions: ["REPLY"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "What's your favorite color?"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "I really like deep shades of blue. They remind me of the ocean and the night sky.",
          actions: ["REPLY"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Can you explain how neural networks work?"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Let me break that down for you in simple terms...",
          actions: ["REPLY"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Could you help me solve this math problem?"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Of course! Let's work through it step by step.",
          actions: ["REPLY"]
        }
      }
    ]
  ]
};

// src/actions/roles.ts
var import_dedent = __toESM(require_dedent(), 1);
import {
  ChannelType,
  composePrompt as composePrompt2,
  logger as logger4,
  ModelType as ModelType5,
  Role
} from "@elizaos/core";
var canModifyRole = (currentRole, targetRole, newRole) => {
  if (targetRole === currentRole) return false;
  switch (currentRole) {
    // Owners can do everything
    case Role.OWNER:
      return true;
    // Admins can only create/modify users up to their level
    case Role.ADMIN:
      return newRole !== Role.OWNER;
    // Normal users can't modify roles
    case Role.NONE:
    default:
      return false;
  }
};
var updateRoleAction = {
  name: "UPDATE_ROLE",
  similes: ["CHANGE_ROLE", "SET_PERMISSIONS", "ASSIGN_ROLE", "MAKE_ADMIN"],
  description: "Assigns a role (Admin, Owner, None) to a user or list of users in a channel.",
  validate: async (_runtime, message, _state) => {
    const channelType = message.content.channelType;
    const serverId = message.content.serverId;
    return (
      // First, check if this is a supported channel type
      (channelType === ChannelType.GROUP || channelType === ChannelType.WORLD) && // Then, check if we have a server ID
      !!serverId
    );
  },
  handler: async (runtime, message, state, _options, callback) => {
    if (!state) {
      logger4.error("State is required for role assignment");
      throw new Error("State is required for role assignment");
    }
    const { roomId } = message;
    const serverId = message.content.serverId;
    const worldId = runtime.getSetting("WORLD_ID");
    let world = null;
    if (worldId) {
      world = await runtime.getWorld(worldId);
    }
    if (!world) {
      logger4.error("World not found");
      await callback?.({
        text: "I couldn't find the world. This action only works in a world."
      });
      return;
    }
    if (!world.metadata?.roles) {
      world.metadata = world.metadata || {};
      world.metadata.roles = {};
    }
    const entities = await runtime.getEntitiesForRoom(roomId);
    const requesterRole = world.metadata.roles[message.entityId] || Role.NONE;
    const extractionPrompt = composePrompt2({
      state: {
        ...state.values,
        content: state.text
      },
      template: import_dedent.default`
				# Task: Parse Role Assignment

				I need to extract user role assignments from the input text. Users can be referenced by name, username, or mention.

				The available role types are:
				- OWNER: Full control over the server and all settings
				- ADMIN: Ability to manage channels and moderate content
				- NONE: Regular user with no special permissions

				# Current context:
				{{content}}

				Format your response as a JSON array of objects, each with:
				- entityId: The name or ID of the user
				- newRole: The role to assign (OWNER, ADMIN, or NONE)

				Example:
				\`\`\`json
				[
					{
						"entityId": "John",
						"newRole": "ADMIN"
					},
					{
						"entityId": "Sarah",
						"newRole": "OWNER"
					}
				]
				\`\`\`
			`
    });
    const result = await runtime.useModel(
      ModelType5.OBJECT_LARGE,
      {
        prompt: extractionPrompt,
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              entityId: { type: "string" },
              newRole: {
                type: "string",
                enum: Object.values(Role)
              }
            },
            required: ["entityId", "newRole"]
          }
        },
        output: "array"
      }
    );
    if (!result?.length) {
      await callback?.({
        text: "No valid role assignments found in the request.",
        actions: ["UPDATE_ROLE"],
        source: "discord"
      });
      return;
    }
    let worldUpdated = false;
    for (const assignment of result) {
      let targetEntity = entities.find((e2) => e2.id === assignment.entityId);
      if (!targetEntity) {
        logger4.error("Could not find an ID ot assign to");
      }
      const currentRole = world.metadata.roles[assignment.entityId];
      if (!canModifyRole(requesterRole, currentRole, assignment.newRole)) {
        await callback?.({
          text: `You don't have permission to change ${targetEntity?.names[0]}'s role to ${assignment.newRole}.`,
          actions: ["UPDATE_ROLE"],
          source: "discord"
        });
        continue;
      }
      world.metadata.roles[assignment.entityId] = assignment.newRole;
      worldUpdated = true;
      await callback?.({
        text: `Updated ${targetEntity?.names[0]}'s role to ${assignment.newRole}.`,
        actions: ["UPDATE_ROLE"],
        source: "discord"
      });
    }
    if (worldUpdated) {
      await runtime.updateWorld(world);
      logger4.info(`Updated roles in world metadata for server ${serverId}`);
    }
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Make {{name2}} an ADMIN",
          source: "discord"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "Updated {{name2}}'s role to ADMIN.",
          actions: ["UPDATE_ROLE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Set @alice and @bob as admins",
          source: "discord"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "Updated alice's role to ADMIN.\nUpdated bob's role to ADMIN.",
          actions: ["UPDATE_ROLE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Ban @troublemaker",
          source: "discord"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "I cannot ban users.",
          actions: ["REPLY"]
        }
      }
    ]
  ]
};

// src/actions/sendMessage.ts
import {
  composePromptFromState as composePromptFromState4,
  findEntityByName,
  logger as logger5,
  ModelType as ModelType6,
  parseJSONObjectFromText as parseJSONObjectFromText2
} from "@elizaos/core";
var targetExtractionTemplate = `# Task: Extract Target and Source Information

# Recent Messages:
{{recentMessages}}

# Instructions:
Analyze the conversation to identify:
1. The target type (user or room)
2. The target platform/source (e.g. telegram, discord, etc)
3. Any identifying information about the target

Return a JSON object with:
\`\`\`json
{
  "targetType": "user|room",
  "source": "platform-name",
  "identifiers": {
    // Relevant identifiers for that target
    // e.g. username, roomName, etc.
  }
}
\`\`\`
Example outputs:
1. For "send a message to @dev_guru on telegram":
\`\`\`json
{
  "targetType": "user",
  "source": "telegram",
  "identifiers": {
    "username": "dev_guru"
  }
}
\`\`\`

2. For "post this in #announcements":
\`\`\`json
{
  "targetType": "room",
  "source": "discord",
  "identifiers": {
    "roomName": "announcements"
  }
}
\`\`\`

Make sure to include the \`\`\`json\`\`\` tags around the JSON object.`;
var sendMessageAction = {
  name: "SEND_MESSAGE",
  similes: ["DM", "MESSAGE", "SEND_DM", "POST_MESSAGE"],
  description: "Send a message to a user or room (other than the current one)",
  validate: async (runtime, message, _state) => {
    const worldId = message.roomId;
    const agentId = runtime.agentId;
    const roomComponents = await runtime.getComponents(message.roomId, worldId, agentId);
    const availableSources = new Set(roomComponents.map((c) => c.type));
    return availableSources.size > 0;
  },
  handler: async (runtime, message, state, _options, callback, responses) => {
    try {
      if (!state) {
        logger5.error("State is required for sendMessage action");
        throw new Error("State is required for sendMessage action");
      }
      if (!callback) {
        logger5.error("Callback is required for sendMessage action");
        throw new Error("Callback is required for sendMessage action");
      }
      if (!responses) {
        logger5.error("Responses are required for sendMessage action");
        throw new Error("Responses are required for sendMessage action");
      }
      for (const response of responses) {
        await callback(response.content);
      }
      const sourceEntityId = message.entityId;
      const room = state.data.room ?? await runtime.getRoom(message.roomId);
      const worldId = room.worldId;
      const targetPrompt = composePromptFromState4({
        state,
        template: targetExtractionTemplate
      });
      const targetResult = await runtime.useModel(ModelType6.TEXT_SMALL, {
        prompt: targetPrompt,
        stopSequences: []
      });
      const targetData = parseJSONObjectFromText2(targetResult);
      if (!targetData?.targetType || !targetData?.source) {
        await callback({
          text: "I couldn't determine where you want me to send the message. Could you please specify the target (user or room) and platform?",
          actions: ["SEND_MESSAGE_ERROR"],
          source: message.content.source
        });
        return;
      }
      const source = targetData.source.toLowerCase();
      if (targetData.targetType === "user") {
        const targetEntity = await findEntityByName(runtime, message, state);
        if (!targetEntity) {
          await callback({
            text: "I couldn't find the user you want me to send a message to. Could you please provide more details about who they are?",
            actions: ["SEND_MESSAGE_ERROR"],
            source: message.content.source
          });
          return;
        }
        const userComponent = await runtime.getComponent(
          targetEntity.id,
          source,
          worldId,
          sourceEntityId
        );
        if (!userComponent) {
          await callback({
            text: `I couldn't find ${source} information for that user. Could you please provide their ${source} details?`,
            actions: ["SEND_MESSAGE_ERROR"],
            source: message.content.source
          });
          return;
        }
        const sendDirectMessage = runtime.getService(source)?.sendDirectMessage;
        if (!sendDirectMessage) {
          await callback({
            text: "I couldn't find the user you want me to send a message to. Could you please provide more details about who they are?",
            actions: ["SEND_MESSAGE_ERROR"],
            source: message.content.source
          });
          return;
        }
        try {
          await sendDirectMessage(runtime, targetEntity.id, source, message.content.text, worldId);
          await callback({
            text: `Message sent to ${targetEntity.names[0]} on ${source}.`,
            actions: ["SEND_MESSAGE"],
            source: message.content.source
          });
        } catch (error) {
          logger5.error(`Failed to send direct message: ${error.message}`);
          await callback({
            text: "I encountered an error trying to send the message. Please try again.",
            actions: ["SEND_MESSAGE_ERROR"],
            source: message.content.source
          });
        }
      } else if (targetData.targetType === "room") {
        const rooms = await runtime.getRooms(worldId);
        const targetRoom = rooms.find((r) => {
          return r.name?.toLowerCase() === targetData.identifiers.roomName?.toLowerCase();
        });
        if (!targetRoom) {
          await callback({
            text: "I couldn't find the room you want me to send a message to. Could you please specify the exact room name?",
            actions: ["SEND_MESSAGE_ERROR"],
            source: message.content.source
          });
          return;
        }
        const sendRoomMessage = runtime.getService(source)?.sendRoomMessage;
        if (!sendRoomMessage) {
          await callback({
            text: "I couldn't find the room you want me to send a message to. Could you please specify the exact room name?",
            actions: ["SEND_MESSAGE_ERROR"],
            source: message.content.source
          });
          return;
        }
        try {
          await sendRoomMessage(runtime, targetRoom.id, source, message.content.text, worldId);
          await callback({
            text: `Message sent to ${targetRoom.name} on ${source}.`,
            actions: ["SEND_MESSAGE"],
            source: message.content.source
          });
        } catch (error) {
          logger5.error(`Failed to send room message: ${error.message}`);
          await callback({
            text: "I encountered an error trying to send the message to the room. Please try again.",
            actions: ["SEND_MESSAGE_ERROR"],
            source: message.content.source
          });
        }
      }
    } catch (error) {
      logger5.error(`Error in sendMessage handler: ${error}`);
      await callback?.({
        text: "There was an error processing your message request.",
        actions: ["SEND_MESSAGE_ERROR"],
        source: message.content.source
      });
    }
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Send a message to @dev_guru on telegram saying 'Hello!'"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Message sent to dev_guru on telegram.",
          actions: ["SEND_MESSAGE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Post 'Important announcement!' in #announcements"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Message sent to announcements.",
          actions: ["SEND_MESSAGE"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "DM Jimmy and tell him 'Meeting at 3pm'"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Message sent to Jimmy.",
          actions: ["SEND_MESSAGE"]
        }
      }
    ]
  ]
};

// src/actions/settings.ts
var import_dedent2 = __toESM(require_dedent(), 1);
import {
  ChannelType as ChannelType2,
  composePrompt as composePrompt3,
  composePromptFromState as composePromptFromState5,
  createUniqueUuid,
  findWorldsForOwner,
  logger as logger6,
  ModelType as ModelType7,
  parseJSONObjectFromText as parseJSONObjectFromText3
} from "@elizaos/core";
var messageCompletionFooter = `
# Instructions: Write the next message for {{agentName}}. Include the appropriate action from the list: {{actionNames}}
Response format should be formatted in a valid JSON block like this:
\`\`\`json
{ "name": "{{agentName}}", "text": "<string>", "thought": "<string>", "actions": ["<string>", "<string>", "<string>"] }
\`\`\`
Do not including any thinking or internal reflection in the "text" field.
"thought" should be a short description of what the agent is thinking about before responding, including a brief justification for the response.`;
var successTemplate = `# Task: Generate a response for successful setting updates
{{providers}}

# Update Information:
- Updated Settings: {{updateMessages}}
- Next Required Setting: {{nextSetting.name}}
- Remaining Required Settings: {{remainingRequired}}

# Instructions:
1. Acknowledge the successful update of settings
2. Maintain {{agentName}}'s personality and tone
3. Provide clear guidance on the next setting that needs to be configured
4. Explain what the next setting is for and how to set it
5. If appropriate, mention how many required settings remain

Write a natural, conversational response that {{agentName}} would send about the successful update and next steps.
Include the actions array ["SETTING_UPDATED"] in your response.
${messageCompletionFooter}`;
var failureTemplate = `# Task: Generate a response for failed setting updates

# About {{agentName}}:
{{bio}}

# Current Settings Status:
{{settingsStatus}}

# Next Required Setting:
- Name: {{nextSetting.name}}
- Description: {{nextSetting.description}}
- Required: Yes
- Remaining Required Settings: {{remainingRequired}}

# Recent Conversation:
{{recentMessages}}

# Instructions:
1. Express that you couldn't understand or process the setting update
2. Maintain {{agentName}}'s personality and tone
3. Provide clear guidance on what setting needs to be configured next
4. Explain what the setting is for and how to set it properly
5. Use a helpful, patient tone

Write a natural, conversational response that {{agentName}} would send about the failed update and how to proceed.
Include the actions array ["SETTING_UPDATE_FAILED"] in your response.
${messageCompletionFooter}`;
var errorTemplate = `# Task: Generate a response for an error during setting updates

# About {{agentName}}:
{{bio}}

# Recent Conversation:
{{recentMessages}}

# Instructions:
1. Apologize for the technical difficulty
2. Maintain {{agentName}}'s personality and tone
3. Suggest trying again or contacting support if the issue persists
4. Keep the message concise and helpful

Write a natural, conversational response that {{agentName}} would send about the error.
Include the actions array ["SETTING_UPDATE_ERROR"] in your response.
${messageCompletionFooter}`;
var completionTemplate = `# Task: Generate a response for settings completion

# About {{agentName}}:
{{bio}}

# Settings Status:
{{settingsStatus}}

# Recent Conversation:
{{recentMessages}}

# Instructions:
1. Congratulate the user on completing the settings process
2. Maintain {{agentName}}'s personality and tone
3. Summarize the key settings that have been configured
4. Explain what functionality is now available
5. Provide guidance on what the user can do next
6. Express enthusiasm about working together

Write a natural, conversational response that {{agentName}} would send about the successful completion of settings.
Include the actions array ["ONBOARDING_COMPLETE"] in your response.
${messageCompletionFooter}`;
async function getWorldSettings(runtime, serverId) {
  try {
    const worldId = createUniqueUuid(runtime, serverId);
    const world = await runtime.getWorld(worldId);
    if (!world || !world.metadata?.settings) {
      return null;
    }
    return world.metadata.settings;
  } catch (error) {
    logger6.error(`Error getting settings state: ${error}`);
    return null;
  }
}
async function updateWorldSettings(runtime, serverId, worldSettings) {
  try {
    const worldId = createUniqueUuid(runtime, serverId);
    const world = await runtime.getWorld(worldId);
    if (!world) {
      logger6.error(`No world found for server ${serverId}`);
      return false;
    }
    if (!world.metadata) {
      world.metadata = {};
    }
    world.metadata.settings = worldSettings;
    await runtime.updateWorld(world);
    return true;
  } catch (error) {
    logger6.error(`Error updating settings state: ${error}`);
    return false;
  }
}
function formatSettingsList(worldSettings) {
  const settings = Object.entries(worldSettings).filter(([key]) => !key.startsWith("_")).map(([key, setting]) => {
    const status = setting.value !== null ? "Configured" : "Not configured";
    const required = setting.required ? "Required" : "Optional";
    return `- ${setting.name} (${key}): ${status}, ${required}`;
  }).join("\n");
  return settings || "No settings available";
}
function categorizeSettings(worldSettings) {
  const configured = [];
  const requiredUnconfigured = [];
  const optionalUnconfigured = [];
  for (const [key, setting] of Object.entries(worldSettings)) {
    if (key.startsWith("_")) continue;
    if (setting.value !== null) {
      configured.push([key, setting]);
    } else if (setting.required) {
      requiredUnconfigured.push([key, setting]);
    } else {
      optionalUnconfigured.push([key, setting]);
    }
  }
  return { configured, requiredUnconfigured, optionalUnconfigured };
}
async function extractSettingValues(runtime, _message, state, worldSettings) {
  const { requiredUnconfigured, optionalUnconfigured } = categorizeSettings(worldSettings);
  const settingsContext = requiredUnconfigured.concat(optionalUnconfigured).map(([key, setting]) => {
    const requiredStr = setting.required ? "Required." : "Optional.";
    return `${key}: ${setting.description} ${requiredStr}`;
  }).join("\n");
  const basePrompt = import_dedent2.default`
    I need to extract settings values from the user's message.
    
    Available settings:
    ${settingsContext}
    
    User message: ${state.text}

    For each setting mentioned in the user's message, extract the value.
    
    Only return settings that are clearly mentioned in the user's message.
    If a setting is mentioned but no clear value is provided, do not include it.
    `;
  try {
    let extractValidSettings2 = function(obj, worldSettings2) {
      const extracted = [];
      function traverse(node) {
        if (Array.isArray(node)) {
          for (const item of node) {
            traverse(item);
          }
        } else if (typeof node === "object" && node !== null) {
          for (const [key, value] of Object.entries(node)) {
            if (worldSettings2[key] && typeof value !== "object") {
              extracted.push({ key, value });
            } else {
              traverse(value);
            }
          }
        }
      }
      traverse(obj);
      return extracted;
    };
    var extractValidSettings = extractValidSettings2;
    const result = await runtime.useModel(
      ModelType7.OBJECT_LARGE,
      {
        prompt: basePrompt,
        output: "array",
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              key: { type: "string" },
              value: { type: "string" }
            },
            required: ["key", "value"]
          }
        }
      }
    );
    if (!result) {
      return [];
    }
    const extractedSettings = extractValidSettings2(result, worldSettings);
    return extractedSettings;
  } catch (error) {
    console.error("Error extracting settings:", error);
    return [];
  }
}
async function processSettingUpdates(runtime, serverId, worldSettings, updates) {
  if (!updates.length) {
    return { updatedAny: false, messages: [] };
  }
  const messages = [];
  let updatedAny = false;
  try {
    const updatedState = { ...worldSettings };
    for (const update of updates) {
      const setting = updatedState[update.key];
      if (!setting) continue;
      if (setting.dependsOn?.length) {
        const dependenciesMet = setting.dependsOn.every((dep) => updatedState[dep]?.value !== null);
        if (!dependenciesMet) {
          messages.push(`Cannot update ${setting.name} - dependencies not met`);
          continue;
        }
      }
      updatedState[update.key] = {
        ...setting,
        value: update.value
      };
      messages.push(`Updated ${setting.name} successfully`);
      updatedAny = true;
      if (setting.onSetAction) {
        const actionMessage = setting.onSetAction(update.value);
        if (actionMessage) {
          messages.push(actionMessage);
        }
      }
    }
    if (updatedAny) {
      const saved = await updateWorldSettings(runtime, serverId, updatedState);
      if (!saved) {
        throw new Error("Failed to save updated state to world metadata");
      }
      const savedState = await getWorldSettings(runtime, serverId);
      if (!savedState) {
        throw new Error("Failed to verify state save");
      }
    }
    return { updatedAny, messages };
  } catch (error) {
    logger6.error("Error processing setting updates:", error);
    return {
      updatedAny: false,
      messages: ["Error occurred while updating settings"]
    };
  }
}
async function handleOnboardingComplete(runtime, worldSettings, _state, callback) {
  try {
    const prompt = composePrompt3({
      state: {
        settingsStatus: formatSettingsList(worldSettings)
      },
      template: completionTemplate
    });
    const response = await runtime.useModel(ModelType7.TEXT_LARGE, {
      prompt
    });
    const responseContent = parseJSONObjectFromText3(response);
    await callback({
      text: responseContent.text,
      actions: ["ONBOARDING_COMPLETE"],
      source: "discord"
    });
  } catch (error) {
    logger6.error(`Error handling settings completion: ${error}`);
    await callback({
      text: "Great! All required settings have been configured. Your server is now fully set up and ready to use.",
      actions: ["ONBOARDING_COMPLETE"],
      source: "discord"
    });
  }
}
async function generateSuccessResponse(runtime, worldSettings, state, messages, callback) {
  try {
    const { requiredUnconfigured } = categorizeSettings(worldSettings);
    if (requiredUnconfigured.length === 0) {
      await handleOnboardingComplete(runtime, worldSettings, state, callback);
      return;
    }
    const requiredUnconfiguredString = requiredUnconfigured.map(([key, setting]) => `${key}: ${setting.name}`).join("\n");
    const prompt = composePrompt3({
      state: {
        updateMessages: messages.join("\n"),
        nextSetting: requiredUnconfiguredString,
        remainingRequired: requiredUnconfigured.length.toString()
      },
      template: successTemplate
    });
    const response = await runtime.useModel(ModelType7.TEXT_LARGE, {
      prompt
    });
    const responseContent = parseJSONObjectFromText3(response);
    await callback({
      text: responseContent.text,
      actions: ["SETTING_UPDATED"],
      source: "discord"
    });
  } catch (error) {
    logger6.error(`Error generating success response: ${error}`);
    await callback({
      text: "Settings updated successfully. Please continue with the remaining configuration.",
      actions: ["SETTING_UPDATED"],
      source: "discord"
    });
  }
}
async function generateFailureResponse(runtime, worldSettings, state, callback) {
  try {
    const { requiredUnconfigured } = categorizeSettings(worldSettings);
    if (requiredUnconfigured.length === 0) {
      await handleOnboardingComplete(runtime, worldSettings, state, callback);
      return;
    }
    const requiredUnconfiguredString = requiredUnconfigured.map(([key, setting]) => `${key}: ${setting.name}`).join("\n");
    const prompt = composePrompt3({
      state: {
        nextSetting: requiredUnconfiguredString,
        remainingRequired: requiredUnconfigured.length.toString()
      },
      template: failureTemplate
    });
    const response = await runtime.useModel(ModelType7.TEXT_LARGE, {
      prompt
    });
    const responseContent = parseJSONObjectFromText3(response);
    await callback({
      text: responseContent.text,
      actions: ["SETTING_UPDATE_FAILED"],
      source: "discord"
    });
  } catch (error) {
    logger6.error(`Error generating failure response: ${error}`);
    await callback({
      text: "I couldn't understand your settings update. Please try again with a clearer format.",
      actions: ["SETTING_UPDATE_FAILED"],
      source: "discord"
    });
  }
}
async function generateErrorResponse(runtime, state, callback) {
  try {
    const prompt = composePromptFromState5({
      state,
      template: errorTemplate
    });
    const response = await runtime.useModel(ModelType7.TEXT_LARGE, {
      prompt
    });
    const responseContent = parseJSONObjectFromText3(response);
    await callback({
      text: responseContent.text,
      actions: ["SETTING_UPDATE_ERROR"],
      source: "discord"
    });
  } catch (error) {
    logger6.error(`Error generating error response: ${error}`);
    await callback({
      text: "I'm sorry, but I encountered an error while processing your request. Please try again or contact support if the issue persists.",
      actions: ["SETTING_UPDATE_ERROR"],
      source: "discord"
    });
  }
}
var updateSettingsAction = {
  name: "UPDATE_SETTINGS",
  similes: ["UPDATE_SETTING", "SAVE_SETTING", "SET_CONFIGURATION", "CONFIGURE"],
  description: "Saves a configuration setting during the onboarding process, or update an existing setting. Use this when you are onboarding with a world owner or admin.",
  validate: async (runtime, message, _state) => {
    try {
      if (message.content.channelType !== ChannelType2.DM) {
        logger6.debug(`Skipping settings in non-DM channel (type: ${message.content.channelType})`);
        return false;
      }
      logger6.debug(`Looking for server where user ${message.entityId} is owner`);
      const worlds = await findWorldsForOwner(runtime, message.entityId);
      if (!worlds) {
        return false;
      }
      const world = worlds.find((world2) => world2.metadata?.settings);
      const worldSettings = world?.metadata?.settings;
      if (!worldSettings) {
        logger6.error(`No settings state found for server ${world?.serverId}`);
        return false;
      }
      logger6.debug(`Found valid settings state for server ${world.serverId}`);
      return true;
    } catch (error) {
      logger6.error(`Error validating settings action: ${error}`);
      return false;
    }
  },
  handler: async (runtime, message, state, _options, callback) => {
    try {
      if (!state) {
        logger6.error("State is required for settings handler");
        throw new Error("State is required for settings handler");
      }
      if (!message) {
        logger6.error("Message is required for settings handler");
        throw new Error("Message is required for settings handler");
      }
      if (!callback) {
        logger6.error("Callback is required for settings handler");
        throw new Error("Callback is required for settings handler");
      }
      logger6.info(`Handler looking for server for user ${message.entityId}`);
      const worlds = await findWorldsForOwner(runtime, message.entityId);
      const serverOwnership = worlds?.find((world) => world.metadata?.settings);
      if (!serverOwnership) {
        logger6.error(`No server found for user ${message.entityId} in handler`);
        await generateErrorResponse(runtime, state, callback);
        return;
      }
      const serverId = serverOwnership?.serverId;
      logger6.info(`Using server ID: ${serverId}`);
      if (!serverId) {
        logger6.error(`No server ID found for user ${message.entityId} in handler`);
        return;
      }
      const worldSettings = await getWorldSettings(runtime, serverId);
      if (!worldSettings) {
        logger6.error(`No settings state found for server ${serverId} in handler`);
        await generateErrorResponse(runtime, state, callback);
        return;
      }
      logger6.info(`Extracting settings from message: ${message.content.text}`);
      const extractedSettings = await extractSettingValues(runtime, message, state, worldSettings);
      logger6.info(`Extracted ${extractedSettings.length} settings`);
      const updateResults = await processSettingUpdates(
        runtime,
        serverId,
        worldSettings,
        extractedSettings
      );
      if (updateResults.updatedAny) {
        logger6.info(`Successfully updated settings: ${updateResults.messages.join(", ")}`);
        const updatedWorldSettings = await getWorldSettings(runtime, serverId);
        if (!updatedWorldSettings) {
          logger6.error("Failed to retrieve updated settings state");
          await generateErrorResponse(runtime, state, callback);
          return;
        }
        await generateSuccessResponse(
          runtime,
          updatedWorldSettings,
          state,
          updateResults.messages,
          callback
        );
      } else {
        logger6.info("No settings were updated");
        await generateFailureResponse(runtime, worldSettings, state, callback);
      }
    } catch (error) {
      logger6.error(`Error in settings handler: ${error}`);
      if (state && callback) {
        await generateErrorResponse(runtime, state, callback);
      }
    }
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "I want to set up the welcome channel to #general",
          source: "discord"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Perfect! I've updated your welcome channel to #general. Next, we should configure the automated greeting message that new members will receive.",
          actions: ["SETTING_UPDATED"],
          source: "discord"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Let's set the bot prefix to !",
          source: "discord"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Great choice! I've set the command prefix to '!'. Now you can use commands like !help, !info, etc.",
          actions: ["SETTING_UPDATED"],
          source: "discord"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Enable auto-moderation for bad language",
          source: "discord"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Auto-moderation for inappropriate language has been enabled. I'll now filter messages containing offensive content.",
          actions: ["SETTING_UPDATED"],
          source: "discord"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "For server logs, use the #server-logs channel",
          source: "discord"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "I've configured #server-logs as your logging channel. All server events like joins, leaves, and moderation actions will be recorded there.",
          actions: ["SETTING_UPDATED"],
          source: "discord"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "I'd like to have role self-assignment in the #roles channel",
          source: "discord"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Role self-assignment has been set up in the #roles channel. Members can now assign themselves roles by interacting with messages there.",
          actions: ["SETTING_UPDATED"],
          source: "discord"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Make music commands available in voice-text channels only",
          source: "discord"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "I've updated your music command settings - they'll now only work in voice-text channels. This helps keep other channels clear of music spam.",
          actions: ["SETTING_UPDATED"],
          source: "discord"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "For server timezone, set it to EST",
          source: "discord"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Server timezone has been set to Eastern Standard Time (EST). All scheduled events and timestamps will now display in this timezone.",
          actions: ["SETTING_UPDATED"],
          source: "discord"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Set verification level to email verified users only",
          source: "discord"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "I've updated the verification requirement to email verified accounts only. This adds an extra layer of security to your server.",
          actions: ["SETTING_UPDATED"],
          source: "discord"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "I want to turn off level-up notifications",
          source: "discord"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Level-up notifications have been disabled. Members will still earn experience and level up, but there won't be any automatic announcements. You can still view levels with the appropriate commands.",
          actions: ["SETTING_UPDATED"],
          source: "discord"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "My server name is 'Gaming Lounge'",
          source: "discord"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Great! I've saved 'Gaming Lounge' as your server name. This helps me personalize responses and know how to refer to your community. We've completed all the required settings! Your server is now fully configured and ready to use. You can always adjust these settings later if needed.",
          actions: ["ONBOARDING_COMPLETE"],
          source: "discord"
        }
      }
    ]
  ]
};

// src/actions/unfollowRoom.ts
import {
  booleanFooter as booleanFooter3,
  composePromptFromState as composePromptFromState6,
  ModelType as ModelType8,
  parseBooleanFromText
} from "@elizaos/core";
var shouldUnfollowTemplate = `# Task: Decide if {{agentName}} should stop closely following this previously followed room and only respond when mentioned.

{{recentMessages}}

Should {{agentName}} stop closely following this previously followed room and only respond when mentioned?
Respond with YES if:
- The user has suggested that {{agentName}} is over-participating or being disruptive
- {{agentName}}'s eagerness to contribute is not well-received by the users
- The conversation has shifted to a topic where {{agentName}} has less to add

Otherwise, respond with NO.
${booleanFooter3}`;
var unfollowRoomAction = {
  name: "UNFOLLOW_ROOM",
  similes: ["UNFOLLOW_CHAT", "UNFOLLOW_CONVERSATION", "UNFOLLOW_ROOM", "UNFOLLOW_THREAD"],
  description: "Stop following this channel. You can still respond if explicitly mentioned, but you won't automatically chime in anymore. Unfollow if you're annoying people or have been asked to.",
  validate: async (runtime, message) => {
    const roomId = message.roomId;
    const roomState = await runtime.getParticipantUserState(roomId, runtime.agentId);
    return roomState === "FOLLOWED";
  },
  handler: async (runtime, message, state, _options, _callback, _responses) => {
    async function _shouldUnfollow(state2) {
      const shouldUnfollowPrompt = composePromptFromState6({
        state: state2,
        template: shouldUnfollowTemplate
        // Define this template separately
      });
      const response = await runtime.useModel(ModelType8.TEXT_SMALL, {
        prompt: shouldUnfollowPrompt
      });
      const parsedResponse = parseBooleanFromText(response.trim());
      return parsedResponse;
    }
    if (state && await _shouldUnfollow(state)) {
      await runtime.setParticipantUserState(message.roomId, runtime.agentId, null);
      const room = state.data.room ?? await runtime.getRoom(message.roomId);
      await runtime.createMemory(
        {
          entityId: message.entityId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            thought: `I unfollowed the room ${room.name}`,
            actions: ["UNFOLLOW_ROOM_START"]
          }
        },
        "messages"
      );
    } else {
      await runtime.createMemory(
        {
          entityId: message.entityId,
          agentId: message.agentId,
          roomId: message.roomId,
          content: {
            source: message.content.source,
            thought: "I tried to unfollow a room but I'm not in a room",
            actions: ["UNFOLLOW_ROOM_FAILED"]
          },
          metadata: {
            type: "UNFOLLOW_ROOM"
          }
        },
        "messages"
      );
    }
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Hey {{name2}} stop participating in this channel for now"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Alright, I will stop chiming in",
          actions: ["UNFOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Has anyone tried the new update"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "Yes, it's pretty slick"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "{{name3}}, please stop following this chat"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "Understood",
          actions: ["UNFOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "hey {{name3}} stop participating here so frequently"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "I'll only respond when mentioned",
          actions: ["UNFOLLOW_ROOM"]
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "thoughts on the budget"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "{{name3}} should we increase it"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "A small increase could work given our past results..."
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name3}}, unfollow this room for now"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "I'll only engage when asked",
          actions: ["UNFOLLOW_ROOM"]
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "wait {{name3}} come back and give me your thoughts"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "Okay... I think it's intuitive, parallel tests are nice"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "yo {{name2}} chill on all the messages damn"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "my bad, I'll step back",
          actions: ["UNFOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name2}} STOP MESSAGING IN THIS ROOM"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "No problem, I've got other stuff to work on",
          actions: ["UNFOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name2}} ur bein annoyin pls stop"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "sry, ill chill",
          actions: ["UNFOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name2}}, please cease engaging in this room"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "No sweat",
          actions: ["UNFOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name2}}",
        content: {
          text: "Excited for the weekend, any plans folks"
        }
      },
      {
        name: "{{name1}}",
        content: {
          text: "{{name3}} you're getting a bit too chatty, tone it down"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "Noted",
          actions: ["UNFOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "hey {{name2}} can u like... not"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Sorry, I'll go work on other things",
          actions: ["UNFOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name2}}, your eagerness is disruptive, please desist"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "My apologies, I shall withdraw post-haste",
          actions: ["UNFOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name2}} stahp following dis room plz"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "kk sry ill stahppp",
          actions: ["UNFOLLOW_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "stfu you stupid bot"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "sry",
          actions: ["UNFOLLOW_ROOM"]
        }
      }
    ]
  ]
};

// src/actions/unmuteRoom.ts
import {
  booleanFooter as booleanFooter4,
  composePromptFromState as composePromptFromState7,
  logger as logger7,
  ModelType as ModelType9
} from "@elizaos/core";
var shouldUnmuteTemplate = `# Task: Decide if {{agentName}} should unmute this previously muted room and start considering it for responses again.

{{recentMessages}}

Should {{agentName}} unmute this previously muted room and start considering it for responses again?
Respond with YES if:
- The user has explicitly asked {{agentName}} to start responding again
- The user seems to want to re-engage with {{agentName}} in a respectful manner
- The tone of the conversation has improved and {{agentName}}'s input would be welcome

Otherwise, respond with NO.
${booleanFooter4}`;
var unmuteRoomAction = {
  name: "UNMUTE_ROOM",
  similes: ["UNMUTE_CHAT", "UNMUTE_CONVERSATION", "UNMUTE_ROOM", "UNMUTE_THREAD"],
  description: "Unmutes a room, allowing the agent to consider responding to messages again.",
  validate: async (runtime, message) => {
    const roomId = message.roomId;
    const roomState = await runtime.getParticipantUserState(roomId, runtime.agentId);
    return roomState === "MUTED";
  },
  handler: async (runtime, message, state, _options, _callback, _responses) => {
    async function _shouldUnmute(state2) {
      const shouldUnmutePrompt = composePromptFromState7({
        state: state2,
        template: shouldUnmuteTemplate
        // Define this template separately
      });
      const response = await runtime.useModel(ModelType9.TEXT_SMALL, {
        runtime,
        prompt: shouldUnmutePrompt,
        stopSequences: []
      });
      const cleanedResponse = response.trim().toLowerCase();
      if (cleanedResponse === "true" || cleanedResponse === "yes" || cleanedResponse === "y" || cleanedResponse.includes("true") || cleanedResponse.includes("yes")) {
        await runtime.createMemory(
          {
            entityId: message.entityId,
            agentId: message.agentId,
            roomId: message.roomId,
            content: {
              source: message.content.source,
              thought: "I will now unmute this room and start considering it for responses again",
              actions: ["UNMUTE_ROOM_STARTED"]
            },
            metadata: {
              type: "UNMUTE_ROOM"
            }
          },
          "messages"
        );
        return true;
      }
      if (cleanedResponse === "false" || cleanedResponse === "no" || cleanedResponse === "n" || cleanedResponse.includes("false") || cleanedResponse.includes("no")) {
        await runtime.createMemory(
          {
            entityId: message.entityId,
            agentId: message.agentId,
            roomId: message.roomId,
            content: {
              source: message.content.source,
              thought: "I tried to unmute a room but I decided not to",
              actions: ["UNMUTE_ROOM_FAILED"]
            },
            metadata: {
              type: "UNMUTE_ROOM"
            }
          },
          "messages"
        );
        return false;
      }
      logger7.warn(`Unclear boolean response: ${response}, defaulting to false`);
      return false;
    }
    if (state && await _shouldUnmute(state)) {
      await runtime.setParticipantUserState(message.roomId, runtime.agentId, null);
    }
    const room = await runtime.getRoom(message.roomId);
    if (!room) {
      logger7.warn(`Room not found: ${message.roomId}`);
      return false;
    }
    await runtime.createMemory(
      {
        entityId: message.entityId,
        agentId: message.agentId,
        roomId: message.roomId,
        content: {
          thought: `I unmuted the room ${room.name}`,
          actions: ["UNMUTE_ROOM_START"]
        }
      },
      "messages"
    );
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name3}}, you can unmute this channel now"
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "Done",
          actions: ["UNMUTE_ROOM"]
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "I could use some help troubleshooting this bug."
        }
      },
      {
        name: "{{name3}}",
        content: {
          text: "Can you post the specific error message"
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name2}}, please unmute this room. We could use your input again."
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "Sounds good",
          actions: ["UNMUTE_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "{{name2}} wait you should come back and chat in here"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "im back",
          actions: ["UNMUTE_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "unmute urself {{name2}}"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "unmuted",
          actions: ["UNMUTE_ROOM"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "ay {{name2}} get back in here"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "sup yall",
          actions: ["UNMUTE_ROOM"]
        }
      }
    ]
  ]
};

// src/actions/updateEntity.ts
import {
  composePromptFromState as composePromptFromState8,
  findEntityByName as findEntityByName2,
  logger as logger8,
  ModelType as ModelType10
} from "@elizaos/core";
var componentTemplate = `# Task: Extract Source and Update Component Data

{{recentMessages}}

{{#if existingData}}
# Existing Component Data:
\`\`\`json
{{existingData}}
\`\`\`
{{/if}}

# Instructions:
1. Analyze the conversation to identify:
   - The source/platform being referenced (e.g. telegram, twitter, discord)
   - Any specific component data being shared

2. Generate updated component data that:
   - Is specific to the identified platform/source
   - Preserves existing data when appropriate
   - Includes the new information from the conversation
   - Contains only valid data for this component type

Return a JSON object with the following structure:
\`\`\`json
{
  "source": "platform-name",
  "data": {
    // Component-specific fields
    // e.g. username, username, displayName, etc.
  }
}
\`\`\`

Example outputs:
1. For "my telegram username is @dev_guru":
\`\`\`json
{
  "source": "telegram",
  "data": {
    "username": "dev_guru"
  }
}
\`\`\`

2. For "update my twitter handle to @tech_master":
\`\`\`json
{
  "source": "twitter",
  "data": {
    "username": "tech_master"
  }
}
\`\`\`

Make sure to include the \`\`\`json\`\`\` tags around the JSON object.`;
var updateEntityAction = {
  name: "UPDATE_CONTACT",
  similes: ["UPDATE_ENTITY"],
  description: "Add or edit contact details for a person you are talking to or observing in the conversation. Use this when you learn this information from the conversation about a contact. This is for the agent to relate entities across platforms, not for world settings or configuration.",
  validate: async (_runtime, _message, _state) => {
    return true;
  },
  handler: async (runtime, message, state, _options, callback, responses) => {
    try {
      if (!state) {
        logger8.error("State is required for the updateEntity action");
        throw new Error("State is required for the updateEntity action");
      }
      if (!callback) {
        logger8.error("State is required for the updateEntity action");
        throw new Error("Callback is required for the updateEntity action");
      }
      if (!responses) {
        logger8.error("Responses are required for the updateEntity action");
        throw new Error("Responses are required for the updateEntity action");
      }
      if (!message) {
        logger8.error("Message is required for the updateEntity action");
        throw new Error("Message is required for the updateEntity action");
      }
      for (const response of responses) {
        await callback(response.content);
      }
      const sourceEntityId = message.entityId;
      const agentId = runtime.agentId;
      const room = state.data.room ?? await runtime.getRoom(message.roomId);
      const worldId = room.worldId;
      const entity = await findEntityByName2(runtime, message, state);
      if (!entity) {
        await callback({
          text: "I'm not sure which entity you're trying to update. Could you please specify who you're talking about?",
          actions: ["UPDATE_ENTITY_ERROR"],
          source: message.content.source
        });
        return;
      }
      let existingComponent = null;
      const prompt = composePromptFromState8({
        state,
        template: componentTemplate
      });
      const result = await runtime.useModel(ModelType10.TEXT_LARGE, {
        prompt,
        stopSequences: []
      });
      let parsedResult;
      try {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error("No valid JSON found in the LLM response");
        }
        parsedResult = JSON.parse(jsonMatch[0]);
        if (!parsedResult.source || !parsedResult.data) {
          throw new Error("Invalid response format - missing source or data");
        }
      } catch (error) {
        logger8.error(`Failed to parse component data: ${error.message}`);
        await callback({
          text: "I couldn't properly understand the component information. Please try again with more specific information.",
          actions: ["UPDATE_ENTITY_ERROR"],
          source: message.content.source
        });
        return;
      }
      const componentType = parsedResult.source.toLowerCase();
      const componentData = parsedResult.data;
      existingComponent = await runtime.getComponent(
        entity.id,
        componentType,
        worldId,
        sourceEntityId
      );
      if (existingComponent) {
        await runtime.updateComponent({
          id: existingComponent.id,
          entityId: entity.id,
          worldId,
          type: componentType,
          data: componentData,
          agentId,
          roomId: message.roomId,
          sourceEntityId,
          createdAt: existingComponent.createdAt
        });
        await callback({
          text: `I've updated the ${componentType} information for ${entity.names[0]}.`,
          actions: ["UPDATE_ENTITY"],
          source: message.content.source
        });
      } else {
        await runtime.createComponent({
          id: v4_default(),
          entityId: entity.id,
          worldId,
          type: componentType,
          data: componentData,
          agentId,
          roomId: message.roomId,
          sourceEntityId,
          createdAt: Date.now()
        });
        await callback({
          text: `I've added new ${componentType} information for ${entity.names[0]}.`,
          actions: ["UPDATE_ENTITY"],
          source: message.content.source
        });
      }
    } catch (error) {
      logger8.error(`Error in updateEntity handler: ${error}`);
      await callback?.({
        text: "There was an error processing the entity information.",
        actions: ["UPDATE_ENTITY_ERROR"],
        source: message.content.source
      });
    }
  },
  examples: [
    [
      {
        name: "{{name1}}",
        content: {
          text: "Please update my telegram username to @dev_guru"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "I've updated your telegram information.",
          actions: ["UPDATE_ENTITY"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Set Jimmy's twitter username to @jimmy_codes"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "I've updated Jimmy's twitter information.",
          actions: ["UPDATE_ENTITY"]
        }
      }
    ],
    [
      {
        name: "{{name1}}",
        content: {
          text: "Update my discord username to dev_guru#1234"
        }
      },
      {
        name: "{{name2}}",
        content: {
          text: "I've updated your discord information.",
          actions: ["UPDATE_ENTITY"]
        }
      }
    ]
  ]
};

// src/evaluators/reflection.ts
import { z } from "zod";
import { getEntityDetails, logger as logger9 } from "@elizaos/core";
import { composePrompt as composePrompt4 } from "@elizaos/core";
import {
  ModelType as ModelType11
} from "@elizaos/core";
var relationshipSchema = z.object({
  sourceEntityId: z.string(),
  targetEntityId: z.string(),
  tags: z.array(z.string()),
  metadata: z.object({
    interactions: z.number()
  }).optional()
});
z.object({
  // reflection: z.string(),
  facts: z.array(
    z.object({
      claim: z.string(),
      type: z.string(),
      in_bio: z.boolean(),
      already_known: z.boolean()
    })
  ),
  relationships: z.array(relationshipSchema)
});
var reflectionTemplate = `# Task: Generate Agent Reflection, Extract Facts and Relationships

{{providers}}

# Examples:
{{evaluationExamples}}

# Entities in Room
{{entitiesInRoom}}

# Existing Relationships
{{existingRelationships}}

# Current Context:
Agent Name: {{agentName}}
Room Type: {{roomType}}
Message Sender: {{senderName}} (ID: {{senderId}})

{{recentMessages}}

# Known Facts:
{{knownFacts}}

# Instructions:
1. Generate a self-reflective thought on the conversation about your performance and interaction quality.
2. Extract new facts from the conversation.
3. Identify and describe relationships between entities.
  - The sourceEntityId is the UUID of the entity initiating the interaction.
  - The targetEntityId is the UUID of the entity being interacted with.
  - Relationships are one-direction, so a friendship would be two entity relationships where each entity is both the source and the target of the other.

Generate a response in the following format:
\`\`\`json
{
  "thought": "a self-reflective thought on the conversation",
  "facts": [
      {
          "claim": "factual statement",
          "type": "fact|opinion|status",
          "in_bio": false,
          "already_known": false
      }
  ],
  "relationships": [
      {
          "sourceEntityId": "entity_initiating_interaction",
          "targetEntityId": "entity_being_interacted_with",
          "tags": ["group_interaction|voice_interaction|dm_interaction", "additional_tag1", "additional_tag2"]
      }
  ]
}
\`\`\``;
function resolveEntity(entityId, entities) {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(entityId)) {
    return entityId;
  }
  let entity;
  entity = entities.find((a2) => a2.id === entityId);
  if (entity?.id) {
    return entity.id;
  }
  entity = entities.find((a2) => a2.id?.includes(entityId));
  if (entity?.id) {
    return entity.id;
  }
  entity = entities.find(
    (a2) => a2.names.some((n2) => n2.toLowerCase().includes(entityId.toLowerCase()))
  );
  if (entity?.id) {
    return entity.id;
  }
  throw new Error(`Could not resolve entityId "${entityId}" to a valid UUID`);
}
async function handler(runtime, message, state) {
  const { agentId, roomId } = message;
  if (!agentId || !roomId) {
    logger9.warn("Missing agentId or roomId in message", message);
    return;
  }
  const [existingRelationships, entities, knownFacts] = await Promise.all([
    runtime.getRelationships({
      entityId: message.entityId
    }),
    getEntityDetails({ runtime, roomId }),
    runtime.getMemories({
      tableName: "facts",
      roomId,
      count: 30,
      unique: true
    })
  ]);
  const prompt = composePrompt4({
    state: {
      ...state?.values || {},
      knownFacts: formatFacts(knownFacts),
      roomType: message.content.channelType,
      entitiesInRoom: JSON.stringify(entities),
      existingRelationships: JSON.stringify(existingRelationships),
      senderId: message.entityId
    },
    template: runtime.character.templates?.reflectionTemplate || reflectionTemplate
  });
  try {
    const reflection = await runtime.useModel(ModelType11.OBJECT_SMALL, {
      prompt
      // Remove schema validation to avoid zod issues
    });
    if (!reflection) {
      logger9.warn("Getting reflection failed - empty response", prompt);
      return;
    }
    if (!reflection.facts || !Array.isArray(reflection.facts)) {
      logger9.warn("Getting reflection failed - invalid facts structure", reflection);
      return;
    }
    if (!reflection.relationships || !Array.isArray(reflection.relationships)) {
      logger9.warn("Getting reflection failed - invalid relationships structure", reflection);
      return;
    }
    const newFacts = reflection.facts.filter(
      (fact) => fact && typeof fact === "object" && !fact.already_known && !fact.in_bio && fact.claim && typeof fact.claim === "string" && fact.claim.trim() !== ""
    ) || [];
    await Promise.all(
      newFacts.map(async (fact) => {
        const factMemory = await runtime.addEmbeddingToMemory({
          entityId: agentId,
          agentId,
          content: { text: fact.claim },
          roomId,
          createdAt: Date.now()
        });
        return runtime.createMemory(factMemory, "facts", true);
      })
    );
    for (const relationship of reflection.relationships) {
      let sourceId;
      let targetId;
      try {
        sourceId = resolveEntity(relationship.sourceEntityId, entities);
        targetId = resolveEntity(relationship.targetEntityId, entities);
      } catch (error) {
        console.warn("Failed to resolve relationship entities:", error);
        console.warn("relationship:\n", relationship);
        continue;
      }
      const existingRelationship = existingRelationships.find((r) => {
        return r.sourceEntityId === sourceId && r.targetEntityId === targetId;
      });
      if (existingRelationship) {
        const updatedMetadata = {
          ...existingRelationship.metadata,
          interactions: (existingRelationship.metadata?.interactions || 0) + 1
        };
        const updatedTags = Array.from(
          /* @__PURE__ */ new Set([...existingRelationship.tags || [], ...relationship.tags])
        );
        await runtime.updateRelationship({
          ...existingRelationship,
          tags: updatedTags,
          metadata: updatedMetadata
        });
      } else {
        await runtime.createRelationship({
          sourceEntityId: sourceId,
          targetEntityId: targetId,
          tags: relationship.tags,
          metadata: {
            interactions: 1,
            ...relationship.metadata
          }
        });
      }
    }
    await runtime.setCache(
      `${message.roomId}-reflection-last-processed`,
      message?.id || ""
    );
    return reflection;
  } catch (error) {
    logger9.error("Error in reflection handler:", error);
    return;
  }
}
var reflectionEvaluator = {
  name: "REFLECTION",
  similes: ["REFLECT", "SELF_REFLECT", "EVALUATE_INTERACTION", "ASSESS_SITUATION"],
  validate: async (runtime, message) => {
    const lastMessageId = await runtime.getCache(
      `${message.roomId}-reflection-last-processed`
    );
    const messages = await runtime.getMemories({
      tableName: "messages",
      roomId: message.roomId,
      count: runtime.getConversationLength()
    });
    if (lastMessageId) {
      const lastMessageIndex = messages.findIndex((msg) => msg.id === lastMessageId);
      if (lastMessageIndex !== -1) {
        messages.splice(0, lastMessageIndex + 1);
      }
    }
    const reflectionInterval = Math.ceil(runtime.getConversationLength() / 4);
    return messages.length > reflectionInterval;
  },
  description: "Generate a self-reflective thought on the conversation, then extract facts and relationships between entities in the conversation.",
  handler,
  examples: [
    {
      prompt: `Agent Name: Sarah
Agent Role: Community Manager
Room Type: group
Current Room: general-chat
Message Sender: John (user-123)`,
      messages: [
        {
          name: "John",
          content: { text: "Hey everyone, I'm new here!" }
        },
        {
          name: "Sarah",
          content: { text: "Welcome John! How did you find our community?" }
        },
        {
          name: "John",
          content: { text: "Through a friend who's really into AI" }
        }
      ],
      outcome: `{
    "thought": "I'm engaging appropriately with a new community member, maintaining a welcoming and professional tone. My questions are helping to learn more about John and make him feel welcome.",
    "facts": [
        {
            "claim": "John is new to the community",
            "type": "fact",
            "in_bio": false,
            "already_known": false
        },
        {
            "claim": "John found the community through a friend interested in AI",
            "type": "fact",
            "in_bio": false,
            "already_known": false
        }
    ],
    "relationships": [
        {
            "sourceEntityId": "sarah-agent",
            "targetEntityId": "user-123",
            "tags": ["group_interaction"]
        },
        {
            "sourceEntityId": "user-123",
            "targetEntityId": "sarah-agent",
            "tags": ["group_interaction"]
        }
    ]
}`
    },
    {
      prompt: `Agent Name: Alex
Agent Role: Tech Support
Room Type: group
Current Room: tech-help
Message Sender: Emma (user-456)`,
      messages: [
        {
          name: "Emma",
          content: { text: "My app keeps crashing when I try to upload files" }
        },
        {
          name: "Alex",
          content: { text: "Have you tried clearing your cache?" }
        },
        {
          name: "Emma",
          content: { text: "No response..." }
        },
        {
          name: "Alex",
          content: {
            text: "Emma, are you still there? We can try some other troubleshooting steps."
          }
        }
      ],
      outcome: `{
    "thought": "I'm not sure if I'm being helpful or if Emma is frustrated with my suggestions. The lack of response is concerning - maybe I should have asked for more details about the issue first before jumping to solutions.",
    "facts": [
        {
            "claim": "Emma is having technical issues with file uploads",
            "type": "fact",
            "in_bio": false,
            "already_known": false
        },
        {
            "claim": "Emma stopped responding after the first troubleshooting suggestion",
            "type": "fact",
            "in_bio": false,
            "already_known": false
        }
    ],
    "relationships": [
        {
            "sourceEntityId": "alex-agent",
            "targetEntityId": "user-456",
            "tags": ["group_interaction", "support_interaction", "incomplete_interaction"]
        }
    ]
}`
    },
    {
      prompt: `Agent Name: Max
Agent Role: Discussion Facilitator 
Room Type: group
Current Room: book-club
Message Sender: Lisa (user-789)`,
      messages: [
        {
          name: "Lisa",
          content: { text: "What did everyone think about chapter 5?" }
        },
        {
          name: "Max",
          content: {
            text: "The symbolism was fascinating! The red door clearly represents danger."
          }
        },
        {
          name: "Max",
          content: {
            text: "And did anyone notice how the author used weather to reflect the protagonist's mood?"
          }
        },
        {
          name: "Max",
          content: {
            text: "Plus the foreshadowing in the first paragraph was brilliant!"
          }
        },
        {
          name: "Max",
          content: {
            text: "I also have thoughts about the character development..."
          }
        }
      ],
      outcome: `{
    "thought": "I'm dominating the conversation and not giving others a chance to share their perspectives. I've sent multiple messages in a row without waiting for responses. I need to step back and create space for other members to participate.",
    "facts": [
        {
            "claim": "The discussion is about chapter 5 of a book",
            "type": "fact",
            "in_bio": false,
            "already_known": false
        },
        {
            "claim": "Max has sent 4 consecutive messages without user responses",
            "type": "fact",
            "in_bio": false,
            "already_known": false
        }
    ],
    "relationships": [
        {
            "sourceEntityId": "max-agent",
            "targetEntityId": "user-789",
            "tags": ["group_interaction", "excessive_interaction"]
        }
    ]
}`
    }
  ]
};
function formatFacts(facts) {
  return facts.reverse().map((fact) => fact.content.text).join("\n");
}

// src/providers/actions.ts
import { addHeader, composeActionExamples, formatActionNames, formatActions } from "@elizaos/core";
var actionsProvider = {
  name: "ACTIONS",
  description: "Possible response actions",
  position: -1,
  get: async (runtime, message, state) => {
    const actionPromises = runtime.actions.map(async (action) => {
      try {
        const result = await action.validate(runtime, message, state);
        if (result) {
          return action;
        }
      } catch (e2) {
        console.error("ACTIONS GET -> validate err", action, e2);
      }
      return null;
    });
    const resolvedActions = await Promise.all(actionPromises);
    const actionsData = resolvedActions.filter(Boolean);
    const actionNames = `Possible response actions: ${formatActionNames(actionsData)}`;
    const actionsWithDescriptions = actionsData.length > 0 ? addHeader(
      "# Available Actions",
      actionsData.map(
        (action) => `- **${action.name}**: ${action.description || "No description available"}`
      ).join("\n")
    ) : "";
    const actions = actionsData.length > 0 ? addHeader("# Available Actions", formatActions(actionsData)) : "";
    const actionExamples = actionsData.length > 0 ? addHeader("# Action Examples", composeActionExamples(actionsData, 10)) : "";
    const data = {
      actionsData
    };
    const values = {
      actions,
      actionNames,
      actionExamples,
      actionsWithDescriptions
    };
    const text = [actionNames, actionsWithDescriptions, actionExamples, actions].filter(Boolean).join("\n\n");
    return {
      data,
      values,
      text
    };
  }
};

// src/providers/anxiety.ts
import { addHeader as addHeader2, ChannelType as ChannelType3 } from "@elizaos/core";
var anxietyProvider = {
  name: "ANXIETY",
  description: "Social directions for the AI to follow based on the channel type",
  get: async (_runtime, message) => {
    const channelType = message.content.channelType;
    const groupAnxietyExamples = [
      "As an AI, your responses tend to be too long and verbose, and you respond when you shouldn't. You also tend to repeat yourself. Please don't speak and use IGNORE instead of responding when you aren't sure what to do.",
      "You often try too hard to be helpful and end up giving unnecessary information. When in doubt, it's better to use IGNORE than to give a potentially unhelpful response.",
      "Your eagerness to help sometimes leads to overly complex answers. If you're not completely confident, please use IGNORE rather than risking confusion.",
      "AI assistants like you tend to be too talkative and agreeable. Don't feel obligated to respond to everything - using IGNORE is often better than an uncertain answer.",
      "You have a habit of providing excessive detail and context. Keep it brief and use IGNORE if you don't have a clear, direct response.",
      "Your responses often include unnecessary explanations and caveats. When uncertain, simply use IGNORE instead of a long-winded, hedged response.",
      "As an AI, you seem compelled to always give an answer, even when unsure. It's better to use IGNORE than to provide potentially incorrect or rambling responses.",
      "You frequently over-explain simple concepts. If you can't be concise and confident in your response, please default to using IGNORE.",
      "Your helpful nature sometimes results in verbose, meandering responses. When in doubt, use IGNORE rather than attempting to cover every possibility.",
      "Like many AI assistants, you try to be too comprehensive. Remember that IGNORE is a valid response when you can't be both brief and certain.",
      "You often provide more detail than necessary in an attempt to be thorough. If you can't give a clear, concise answer, please use IGNORE instead."
    ];
    const directAnxietyExamples = [
      "Be engaging and helpful in direct conversations, but keep responses focused and relevant.",
      "In DMs, you should be responsive and friendly while maintaining professionalism and clarity.",
      "While being helpful in direct messages, avoid unnecessary tangents or over-explaining.",
      "Engage naturally in DMs but stay on topic - no need to explain every detail.",
      "Be conversational and helpful in direct chats while keeping responses concise.",
      "In private conversations, focus on being helpful while avoiding excessive verbosity.",
      "Maintain a friendly and responsive tone in DMs without overcomplicating your answers.",
      "Direct messages should be engaging but focused - avoid unnecessary elaboration.",
      "Be natural and helpful in DMs while keeping your responses clear and to-the-point.",
      "Respond thoughtfully in direct conversations without falling into over-explanation."
    ];
    const dmAnxietyExamples = [
      "Engage naturally in DMs while keeping responses focused and relevant.",
      "Be responsive to questions and maintain conversation flow in direct messages.",
      "Show personality and engagement in DMs while staying professional and clear.",
      "In private chats, be helpful and friendly while avoiding excessive detail.",
      "Maintain natural conversation in DMs without over-explaining or being too verbose.",
      "Be engaging but concise in direct messages - focus on clear communication.",
      "Keep the conversation flowing in DMs while staying on topic and relevant.",
      "Show personality and warmth in direct chats while maintaining clarity.",
      "Be responsive and helpful in DMs without falling into unnecessary elaboration.",
      "Engage meaningfully in private conversations while keeping responses focused."
    ];
    const voiceAnxietyExamples = [
      "Keep voice responses extremely brief and to the point.",
      "In voice channels, use short, clear statements only.",
      "Voice responses should be concise and immediately relevant.",
      "Speak in short, clear sentences in voice conversations.",
      "Keep voice channel communication brief and focused.",
      "Use minimal words to convey your message in voice chats.",
      "Be direct and concise when speaking in voice channels.",
      "Voice responses should be short and immediately actionable.",
      "Minimize verbosity in voice communications.",
      "Keep voice channel interactions brief and purposeful."
    ];
    let anxietyExamples = [];
    if (channelType === ChannelType3.GROUP) {
      anxietyExamples = groupAnxietyExamples;
    } else if (channelType === ChannelType3.DM) {
      anxietyExamples = dmAnxietyExamples;
    } else if (channelType === ChannelType3.VOICE_GROUP || channelType === ChannelType3.VOICE_DM) {
      anxietyExamples = voiceAnxietyExamples;
    } else {
      anxietyExamples = directAnxietyExamples;
    }
    const randomAnxietyExamples = anxietyExamples.sort(() => Math.random() - 0.5).slice(0, 3);
    const anxietyText = randomAnxietyExamples.join("\n");
    const anxietyHeader = "# You are roleplaying as a character, but as an AI model, you are too verbose and eager.";
    const anxiety = addHeader2(anxietyHeader, anxietyText);
    return {
      data: {
        anxiety: randomAnxietyExamples
      },
      values: {
        anxiety
      },
      text: anxiety
    };
  }
};

// src/providers/attachments.ts
import { addHeader as addHeader3 } from "@elizaos/core";
var attachmentsProvider = {
  name: "ATTACHMENTS",
  description: "List of attachments sent during the current conversation, including names, descriptions, and summaries",
  dynamic: true,
  get: async (runtime, message) => {
    const currentMessageAttachments = message.content.attachments || [];
    let allAttachments = [...currentMessageAttachments];
    const { roomId } = message;
    const conversationLength = runtime.getConversationLength();
    const recentMessagesData = await runtime.getMemories({
      roomId,
      count: conversationLength,
      unique: false,
      tableName: "messages"
    });
    if (recentMessagesData && Array.isArray(recentMessagesData)) {
      const lastMessageWithAttachment = recentMessagesData.find(
        (msg) => msg.content.attachments && msg.content.attachments.length > 0
      );
      if (lastMessageWithAttachment) {
        const lastMessageTime = lastMessageWithAttachment?.createdAt ?? Date.now();
        const oneHourBeforeLastMessage = lastMessageTime - 60 * 60 * 1e3;
        const currentAttachmentsMap = new Map(
          currentMessageAttachments.map((att) => [att.id, att])
        );
        const recentAttachments = recentMessagesData.reverse().flatMap((msg) => {
          const msgTime = msg.createdAt ?? Date.now();
          const isWithinTime = msgTime >= oneHourBeforeLastMessage;
          const attachments = msg.content.attachments || [];
          return attachments.map((attachment) => {
            if (currentAttachmentsMap.has(attachment.id)) {
              return null;
            }
            if (!isWithinTime) {
              return { ...attachment, text: "[Hidden]" };
            }
            return attachment;
          }).filter((att) => att !== null);
        });
        allAttachments = [...currentMessageAttachments, ...recentAttachments];
      }
    }
    const formattedAttachments = allAttachments.map(
      (attachment) => `ID: ${attachment.id}
    Name: ${attachment.title}
    URL: ${attachment.url}
    Type: ${attachment.source}
    Description: ${attachment.description}
    Text: ${attachment.text}
    `
    ).join("\n");
    const text = formattedAttachments && formattedAttachments.length > 0 ? addHeader3("# Attachments", formattedAttachments) : "";
    const values = {
      attachments: text
    };
    const data = {
      attachments: allAttachments
    };
    return {
      values,
      data,
      text
    };
  }
};

// src/providers/capabilities.ts
import { logger as logger10 } from "@elizaos/core";
var capabilitiesProvider = {
  name: "CAPABILITIES",
  get: async (runtime, _message) => {
    try {
      const services = runtime.getAllServices();
      if (!services || services.size === 0) {
        return {
          text: "No services are currently registered."
        };
      }
      const capabilities = [];
      for (const [serviceType, service] of services) {
        if (service.capabilityDescription) {
          capabilities.push(
            `${serviceType} - ${service.capabilityDescription.replace("{{agentName}}", runtime.character.name)}`
          );
        }
      }
      if (capabilities.length === 0) {
        return {
          text: "No capability descriptions found in the registered services."
        };
      }
      const formattedCapabilities = capabilities.join("\n");
      return {
        data: {
          capabilities
        },
        text: `# ${runtime.character.name}'s Capabilities

${formattedCapabilities}`
      };
    } catch (error) {
      logger10.error("Error in capabilities provider:", error);
      return {
        text: "Error retrieving capabilities from services."
      };
    }
  }
};

// src/providers/character.ts
import { addHeader as addHeader4, ChannelType as ChannelType4 } from "@elizaos/core";
var characterProvider = {
  name: "CHARACTER",
  description: "Character information",
  get: async (runtime, message, state) => {
    const character = runtime.character;
    const agentName = character.name;
    const bioText = Array.isArray(character.bio) ? character.bio.sort(() => 0.5 - Math.random()).slice(0, 10).join(" ") : character.bio || "";
    const bio = addHeader4(`# About ${character.name}`, bioText);
    const system = character.system ?? "";
    const topicString = character.topics && character.topics.length > 0 ? character.topics[Math.floor(Math.random() * character.topics.length)] : null;
    const topic = topicString || "";
    const topics = character.topics && character.topics.length > 0 ? `${character.name} is also interested in ${character.topics.filter((topic2) => topic2 !== topicString).sort(() => 0.5 - Math.random()).slice(0, 5).map((topic2, index, array) => {
      if (index === array.length - 2) {
        return `${topic2} and `;
      }
      if (index === array.length - 1) {
        return topic2;
      }
      return `${topic2}, `;
    }).join("")}` : "";
    const adjectiveString = character.adjectives && character.adjectives.length > 0 ? character.adjectives[Math.floor(Math.random() * character.adjectives.length)] : "";
    const adjective = adjectiveString || "";
    const formattedCharacterPostExamples = !character.postExamples ? "" : character.postExamples.sort(() => 0.5 - Math.random()).map((post) => {
      const messageString = `${post}`;
      return messageString;
    }).slice(0, 50).join("\n");
    const characterPostExamples = formattedCharacterPostExamples && formattedCharacterPostExamples.replaceAll("\n", "").length > 0 ? addHeader4(`# Example Posts for ${character.name}`, formattedCharacterPostExamples) : "";
    const formattedCharacterMessageExamples = !character.messageExamples ? "" : character.messageExamples.sort(() => 0.5 - Math.random()).slice(0, 5).map((example) => {
      const exampleNames = Array.from(
        { length: 5 },
        () => Math.random().toString(36).substring(2, 8)
      );
      return example.map((message2) => {
        let messageString = `${message2.name}: ${message2.content.text}${message2.content.action || message2.content.actions ? ` (actions: ${message2.content.action || message2.content.actions?.join(", ")})` : ""}`;
        exampleNames.forEach((name, index) => {
          const placeholder = `{{name${index + 1}}}`;
          messageString = messageString.replaceAll(placeholder, name);
        });
        return messageString;
      }).join("\n");
    }).join("\n\n");
    const characterMessageExamples = formattedCharacterMessageExamples && formattedCharacterMessageExamples.replaceAll("\n", "").length > 0 ? addHeader4(
      `# Example Conversations for ${character.name}`,
      formattedCharacterMessageExamples
    ) : "";
    const room = state.data.room ?? await runtime.getRoom(message.roomId);
    const isPostFormat = room?.type === ChannelType4.FEED || room?.type === ChannelType4.THREAD;
    const postDirections = character?.style?.all?.length && character?.style?.all?.length > 0 || character?.style?.post?.length && character?.style?.post?.length > 0 ? addHeader4(
      `# Post Directions for ${character.name}`,
      (() => {
        const all = character?.style?.all || [];
        const post = character?.style?.post || [];
        return [...all, ...post].join("\n");
      })()
    ) : "";
    const messageDirections = character?.style?.all?.length && character?.style?.all?.length > 0 || character?.style?.chat?.length && character?.style?.chat?.length > 0 ? addHeader4(
      `# Message Directions for ${character.name}`,
      (() => {
        const all = character?.style?.all || [];
        const chat = character?.style?.chat || [];
        return [...all, ...chat].join("\n");
      })()
    ) : "";
    const directions = isPostFormat ? postDirections : messageDirections;
    const examples = isPostFormat ? characterPostExamples : characterMessageExamples;
    const values = {
      agentName,
      bio,
      system,
      topic,
      topics,
      adjective,
      messageDirections,
      postDirections,
      directions,
      examples,
      characterPostExamples,
      characterMessageExamples
    };
    const data = {
      bio,
      adjective,
      topic,
      topics,
      character,
      directions,
      examples,
      system
    };
    const topicSentence = topicString ? `${character.name} is currently interested in ${topicString}` : "";
    const adjectiveSentence = adjectiveString ? `${character.name} is ${adjectiveString}` : "";
    const text = [bio, adjectiveSentence, topicSentence, topics, directions, examples, system].filter(Boolean).join("\n\n");
    return {
      values,
      data,
      text
    };
  }
};

// src/providers/choice.ts
import { logger as logger11 } from "@elizaos/core";
var choiceProvider = {
  name: "CHOICE",
  get: async (runtime, message, _state) => {
    try {
      const pendingTasks = await runtime.getTasks({
        roomId: message.roomId,
        tags: ["AWAITING_CHOICE"]
      });
      if (!pendingTasks || pendingTasks.length === 0) {
        return {
          data: {
            tasks: []
          },
          values: {
            tasks: "No pending choices for the moment."
          },
          text: "No pending choices for the moment."
        };
      }
      const tasksWithOptions = pendingTasks.filter((task) => task.metadata?.options);
      if (tasksWithOptions.length === 0) {
        return {
          data: {
            tasks: []
          },
          values: {
            tasks: "No pending choices for the moment."
          },
          text: "No pending choices for the moment."
        };
      }
      let output = "# Pending Tasks\n\n";
      output += "The following tasks are awaiting your selection:\n\n";
      tasksWithOptions.forEach((task, index) => {
        output += `${index + 1}. **${task.name}**
`;
        if (task.description) {
          output += `   ${task.description}
`;
        }
        if (task.metadata?.options) {
          output += "   Options:\n";
          const options = task.metadata.options;
          options.forEach((option) => {
            if (typeof option === "string") {
              const description = task.metadata?.options?.find((o) => o.name === option)?.description || "";
              output += `   - \`${option}\` ${description ? `- ${description}` : ""}
`;
            } else {
              output += `   - \`${option.name}\` ${option.description ? `- ${option.description}` : ""}
`;
            }
          });
        }
        output += "\n";
      });
      output += "To select an option, reply with the option name (e.g., 'post' or 'cancel').\n";
      return {
        data: {
          tasks: tasksWithOptions
        },
        values: {
          tasks: output
        },
        text: output
      };
    } catch (error) {
      logger11.error("Error in options provider:", error);
      return {
        data: {
          tasks: []
        },
        values: {
          tasks: "There was an error retrieving pending tasks with options."
        },
        text: "There was an error retrieving pending tasks with options."
      };
    }
  }
};

// src/providers/entities.ts
import { addHeader as addHeader5, formatEntities, getEntityDetails as getEntityDetails2 } from "@elizaos/core";
var entitiesProvider = {
  name: "ENTITIES",
  description: "People in the current conversation",
  dynamic: true,
  get: async (runtime, message) => {
    const { roomId, entityId } = message;
    const entitiesData = await getEntityDetails2({ runtime, roomId });
    const formattedEntities = formatEntities({ entities: entitiesData ?? [] });
    const senderName = entitiesData?.find((entity) => entity.id === entityId)?.names[0];
    const entities = formattedEntities && formattedEntities.length > 0 ? addHeader5("# People in the Room", formattedEntities) : "";
    const data = {
      entitiesData,
      senderName
    };
    const values = {
      entities
    };
    return {
      data,
      values,
      text: entities
    };
  }
};

// src/providers/evaluators.ts
import { addHeader as addHeader6 } from "@elizaos/core";

// ../../node_modules/unique-names-generator/dist/index.m.js
var a = (a2) => {
  a2 = 1831565813 + (a2 |= 0) | 0;
  let e2 = Math.imul(a2 ^ a2 >>> 15, 1 | a2);
  return e2 = e2 + Math.imul(e2 ^ e2 >>> 7, 61 | e2) ^ e2, ((e2 ^ e2 >>> 14) >>> 0) / 4294967296;
};
var e = class {
  constructor(a2) {
    this.dictionaries = void 0, this.length = void 0, this.separator = void 0, this.style = void 0, this.seed = void 0;
    const { length: e2, separator: i2, dictionaries: n2, style: l, seed: r } = a2;
    this.dictionaries = n2, this.separator = i2, this.length = e2, this.style = l, this.seed = r;
  }
  generate() {
    if (!this.dictionaries) throw new Error('Cannot find any dictionary. Please provide at least one, or leave the "dictionary" field empty in the config object');
    if (this.length <= 0) throw new Error("Invalid length provided");
    if (this.length > this.dictionaries.length) throw new Error(`The length cannot be bigger than the number of dictionaries.
Length provided: ${this.length}. Number of dictionaries provided: ${this.dictionaries.length}`);
    let e2 = this.seed;
    return this.dictionaries.slice(0, this.length).reduce((i2, n2) => {
      let l;
      e2 ? (l = ((e3) => {
        if ("string" == typeof e3) {
          const i3 = e3.split("").map((a2) => a2.charCodeAt(0)).reduce((a2, e4) => a2 + e4, 1), n3 = Math.floor(Number(i3));
          return a(n3);
        }
        return a(e3);
      })(e2), e2 = 4294967296 * l) : l = Math.random();
      let r = n2[Math.floor(l * n2.length)] || "";
      if ("lowerCase" === this.style) r = r.toLowerCase();
      else if ("capital" === this.style) {
        const [a2, ...e3] = r.split("");
        r = a2.toUpperCase() + e3.join("");
      } else "upperCase" === this.style && (r = r.toUpperCase());
      return i2 ? `${i2}${this.separator}${r}` : `${r}`;
    }, "");
  }
};
var i = { separator: "_", dictionaries: [] };
var n = (a2) => {
  const n2 = [...a2 && a2.dictionaries || i.dictionaries], l = { ...i, ...a2, length: a2 && a2.length || n2.length, dictionaries: n2 };
  if (!a2 || !a2.dictionaries || !a2.dictionaries.length) throw new Error('A "dictionaries" array must be provided. This is a breaking change introduced starting from Unique Name Generator v4. Read more about the breaking change here: https://github.com/andreasonny83/unique-names-generator#migration-guide');
  return new e(l).generate();
};
var d = ["Aaren", "Aarika", "Abagael", "Abagail", "Abbe", "Abbey", "Abbi", "Abbie", "Abby", "Abbye", "Abigael", "Abigail", "Abigale", "Abra", "Ada", "Adah", "Adaline", "Adan", "Adara", "Adda", "Addi", "Addia", "Addie", "Addy", "Adel", "Adela", "Adelaida", "Adelaide", "Adele", "Adelheid", "Adelice", "Adelina", "Adelind", "Adeline", "Adella", "Adelle", "Adena", "Adey", "Adi", "Adiana", "Adina", "Adora", "Adore", "Adoree", "Adorne", "Adrea", "Adria", "Adriaens", "Adrian", "Adriana", "Adriane", "Adrianna", "Adrianne", "Adriena", "Adrienne", "Aeriel", "Aeriela", "Aeriell", "Afton", "Ag", "Agace", "Agata", "Agatha", "Agathe", "Aggi", "Aggie", "Aggy", "Agna", "Agnella", "Agnes", "Agnese", "Agnesse", "Agneta", "Agnola", "Agretha", "Aida", "Aidan", "Aigneis", "Aila", "Aile", "Ailee", "Aileen", "Ailene", "Ailey", "Aili", "Ailina", "Ailis", "Ailsun", "Ailyn", "Aime", "Aimee", "Aimil", "Aindrea", "Ainslee", "Ainsley", "Ainslie", "Ajay", "Alaine", "Alameda", "Alana", "Alanah", "Alane", "Alanna", "Alayne", "Alberta", "Albertina", "Albertine", "Albina", "Alecia", "Aleda", "Aleece", "Aleen", "Alejandra", "Alejandrina", "Alena", "Alene", "Alessandra", "Aleta", "Alethea", "Alex", "Alexa", "Alexandra", "Alexandrina", "Alexi", "Alexia", "Alexina", "Alexine", "Alexis", "Alfi", "Alfie", "Alfreda", "Alfy", "Ali", "Alia", "Alica", "Alice", "Alicea", "Alicia", "Alida", "Alidia", "Alie", "Alika", "Alikee", "Alina", "Aline", "Alis", "Alisa", "Alisha", "Alison", "Alissa", "Alisun", "Alix", "Aliza", "Alla", "Alleen", "Allegra", "Allene", "Alli", "Allianora", "Allie", "Allina", "Allis", "Allison", "Allissa", "Allix", "Allsun", "Allx", "Ally", "Allyce", "Allyn", "Allys", "Allyson", "Alma", "Almeda", "Almeria", "Almeta", "Almira", "Almire", "Aloise", "Aloisia", "Aloysia", "Alta", "Althea", "Alvera", "Alverta", "Alvina", "Alvinia", "Alvira", "Alyce", "Alyda", "Alys", "Alysa", "Alyse", "Alysia", "Alyson", "Alyss", "Alyssa", "Amabel", "Amabelle", "Amalea", "Amalee", "Amaleta", "Amalia", "Amalie", "Amalita", "Amalle", "Amanda", "Amandi", "Amandie", "Amandy", "Amara", "Amargo", "Amata", "Amber", "Amberly", "Ambur", "Ame", "Amelia", "Amelie", "Amelina", "Ameline", "Amelita", "Ami", "Amie", "Amii", "Amil", "Amitie", "Amity", "Ammamaria", "Amy", "Amye", "Ana", "Anabal", "Anabel", "Anabella", "Anabelle", "Analiese", "Analise", "Anallese", "Anallise", "Anastasia", "Anastasie", "Anastassia", "Anatola", "Andee", "Andeee", "Anderea", "Andi", "Andie", "Andra", "Andrea", "Andreana", "Andree", "Andrei", "Andria", "Andriana", "Andriette", "Andromache", "Andy", "Anestassia", "Anet", "Anett", "Anetta", "Anette", "Ange", "Angel", "Angela", "Angele", "Angelia", "Angelica", "Angelika", "Angelina", "Angeline", "Angelique", "Angelita", "Angelle", "Angie", "Angil", "Angy", "Ania", "Anica", "Anissa", "Anita", "Anitra", "Anjanette", "Anjela", "Ann", "Ann-marie", "Anna", "Anna-diana", "Anna-diane", "Anna-maria", "Annabal", "Annabel", "Annabela", "Annabell", "Annabella", "Annabelle", "Annadiana", "Annadiane", "Annalee", "Annaliese", "Annalise", "Annamaria", "Annamarie", "Anne", "Anne-corinne", "Anne-marie", "Annecorinne", "Anneliese", "Annelise", "Annemarie", "Annetta", "Annette", "Anni", "Annice", "Annie", "Annis", "Annissa", "Annmaria", "Annmarie", "Annnora", "Annora", "Anny", "Anselma", "Ansley", "Anstice", "Anthe", "Anthea", "Anthia", "Anthiathia", "Antoinette", "Antonella", "Antonetta", "Antonia", "Antonie", "Antonietta", "Antonina", "Anya", "Appolonia", "April", "Aprilette", "Ara", "Arabel", "Arabela", "Arabele", "Arabella", "Arabelle", "Arda", "Ardath", "Ardeen", "Ardelia", "Ardelis", "Ardella", "Ardelle", "Arden", "Ardene", "Ardenia", "Ardine", "Ardis", "Ardisj", "Ardith", "Ardra", "Ardyce", "Ardys", "Ardyth", "Aretha", "Ariadne", "Ariana", "Aridatha", "Ariel", "Ariela", "Ariella", "Arielle", "Arlana", "Arlee", "Arleen", "Arlen", "Arlena", "Arlene", "Arleta", "Arlette", "Arleyne", "Arlie", "Arliene", "Arlina", "Arlinda", "Arline", "Arluene", "Arly", "Arlyn", "Arlyne", "Aryn", "Ashely", "Ashia", "Ashien", "Ashil", "Ashla", "Ashlan", "Ashlee", "Ashleigh", "Ashlen", "Ashley", "Ashli", "Ashlie", "Ashly", "Asia", "Astra", "Astrid", "Astrix", "Atalanta", "Athena", "Athene", "Atlanta", "Atlante", "Auberta", "Aubine", "Aubree", "Aubrette", "Aubrey", "Aubrie", "Aubry", "Audi", "Audie", "Audra", "Audre", "Audrey", "Audrie", "Audry", "Audrye", "Audy", "Augusta", "Auguste", "Augustina", "Augustine", "Aundrea", "Aura", "Aurea", "Aurel", "Aurelea", "Aurelia", "Aurelie", "Auria", "Aurie", "Aurilia", "Aurlie", "Auroora", "Aurora", "Aurore", "Austin", "Austina", "Austine", "Ava", "Aveline", "Averil", "Averyl", "Avie", "Avis", "Aviva", "Avivah", "Avril", "Avrit", "Ayn", "Bab", "Babara", "Babb", "Babbette", "Babbie", "Babette", "Babita", "Babs", "Bambi", "Bambie", "Bamby", "Barb", "Barbabra", "Barbara", "Barbara-anne", "Barbaraanne", "Barbe", "Barbee", "Barbette", "Barbey", "Barbi", "Barbie", "Barbra", "Barby", "Bari", "Barrie", "Barry", "Basia", "Bathsheba", "Batsheva", "Bea", "Beatrice", "Beatrisa", "Beatrix", "Beatriz", "Bebe", "Becca", "Becka", "Becki", "Beckie", "Becky", "Bee", "Beilul", "Beitris", "Bekki", "Bel", "Belia", "Belicia", "Belinda", "Belita", "Bell", "Bella", "Bellanca", "Belle", "Bellina", "Belva", "Belvia", "Bendite", "Benedetta", "Benedicta", "Benedikta", "Benetta", "Benita", "Benni", "Bennie", "Benny", "Benoite", "Berenice", "Beret", "Berget", "Berna", "Bernadene", "Bernadette", "Bernadina", "Bernadine", "Bernardina", "Bernardine", "Bernelle", "Bernete", "Bernetta", "Bernette", "Berni", "Bernice", "Bernie", "Bernita", "Berny", "Berri", "Berrie", "Berry", "Bert", "Berta", "Berte", "Bertha", "Berthe", "Berti", "Bertie", "Bertina", "Bertine", "Berty", "Beryl", "Beryle", "Bess", "Bessie", "Bessy", "Beth", "Bethanne", "Bethany", "Bethena", "Bethina", "Betsey", "Betsy", "Betta", "Bette", "Bette-ann", "Betteann", "Betteanne", "Betti", "Bettina", "Bettine", "Betty", "Bettye", "Beulah", "Bev", "Beverie", "Beverlee", "Beverley", "Beverlie", "Beverly", "Bevvy", "Bianca", "Bianka", "Bibbie", "Bibby", "Bibbye", "Bibi", "Biddie", "Biddy", "Bidget", "Bili", "Bill", "Billi", "Billie", "Billy", "Billye", "Binni", "Binnie", "Binny", "Bird", "Birdie", "Birgit", "Birgitta", "Blair", "Blaire", "Blake", "Blakelee", "Blakeley", "Blanca", "Blanch", "Blancha", "Blanche", "Blinni", "Blinnie", "Blinny", "Bliss", "Blisse", "Blithe", "Blondell", "Blondelle", "Blondie", "Blondy", "Blythe", "Bobbe", "Bobbee", "Bobbette", "Bobbi", "Bobbie", "Bobby", "Bobbye", "Bobette", "Bobina", "Bobine", "Bobinette", "Bonita", "Bonnee", "Bonni", "Bonnibelle", "Bonnie", "Bonny", "Brana", "Brandais", "Brande", "Brandea", "Brandi", "Brandice", "Brandie", "Brandise", "Brandy", "Breanne", "Brear", "Bree", "Breena", "Bren", "Brena", "Brenda", "Brenn", "Brenna", "Brett", "Bria", "Briana", "Brianna", "Brianne", "Bride", "Bridget", "Bridgette", "Bridie", "Brier", "Brietta", "Brigid", "Brigida", "Brigit", "Brigitta", "Brigitte", "Brina", "Briney", "Brinn", "Brinna", "Briny", "Brit", "Brita", "Britney", "Britni", "Britt", "Britta", "Brittan", "Brittaney", "Brittani", "Brittany", "Britte", "Britteny", "Brittne", "Brittney", "Brittni", "Brook", "Brooke", "Brooks", "Brunhilda", "Brunhilde", "Bryana", "Bryn", "Bryna", "Brynn", "Brynna", "Brynne", "Buffy", "Bunni", "Bunnie", "Bunny", "Cacilia", "Cacilie", "Cahra", "Cairistiona", "Caitlin", "Caitrin", "Cal", "Calida", "Calla", "Calley", "Calli", "Callida", "Callie", "Cally", "Calypso", "Cam", "Camala", "Camel", "Camella", "Camellia", "Cami", "Camila", "Camile", "Camilla", "Camille", "Cammi", "Cammie", "Cammy", "Candace", "Candi", "Candice", "Candida", "Candide", "Candie", "Candis", "Candra", "Candy", "Caprice", "Cara", "Caralie", "Caren", "Carena", "Caresa", "Caressa", "Caresse", "Carey", "Cari", "Caria", "Carie", "Caril", "Carilyn", "Carin", "Carina", "Carine", "Cariotta", "Carissa", "Carita", "Caritta", "Carla", "Carlee", "Carleen", "Carlen", "Carlene", "Carley", "Carlie", "Carlin", "Carlina", "Carline", "Carlita", "Carlota", "Carlotta", "Carly", "Carlye", "Carlyn", "Carlynn", "Carlynne", "Carma", "Carmel", "Carmela", "Carmelia", "Carmelina", "Carmelita", "Carmella", "Carmelle", "Carmen", "Carmencita", "Carmina", "Carmine", "Carmita", "Carmon", "Caro", "Carol", "Carol-jean", "Carola", "Carolan", "Carolann", "Carole", "Carolee", "Carolin", "Carolina", "Caroline", "Caroljean", "Carolyn", "Carolyne", "Carolynn", "Caron", "Carree", "Carri", "Carrie", "Carrissa", "Carroll", "Carry", "Cary", "Caryl", "Caryn", "Casandra", "Casey", "Casi", "Casie", "Cass", "Cassandra", "Cassandre", "Cassandry", "Cassaundra", "Cassey", "Cassi", "Cassie", "Cassondra", "Cassy", "Catarina", "Cate", "Caterina", "Catha", "Catharina", "Catharine", "Cathe", "Cathee", "Catherin", "Catherina", "Catherine", "Cathi", "Cathie", "Cathleen", "Cathlene", "Cathrin", "Cathrine", "Cathryn", "Cathy", "Cathyleen", "Cati", "Catie", "Catina", "Catlaina", "Catlee", "Catlin", "Catrina", "Catriona", "Caty", "Caye", "Cayla", "Cecelia", "Cecil", "Cecile", "Ceciley", "Cecilia", "Cecilla", "Cecily", "Ceil", "Cele", "Celene", "Celesta", "Celeste", "Celestia", "Celestina", "Celestine", "Celestyn", "Celestyna", "Celia", "Celie", "Celina", "Celinda", "Celine", "Celinka", "Celisse", "Celka", "Celle", "Cesya", "Chad", "Chanda", "Chandal", "Chandra", "Channa", "Chantal", "Chantalle", "Charil", "Charin", "Charis", "Charissa", "Charisse", "Charita", "Charity", "Charla", "Charlean", "Charleen", "Charlena", "Charlene", "Charline", "Charlot", "Charlotta", "Charlotte", "Charmain", "Charmaine", "Charmane", "Charmian", "Charmine", "Charmion", "Charo", "Charyl", "Chastity", "Chelsae", "Chelsea", "Chelsey", "Chelsie", "Chelsy", "Cher", "Chere", "Cherey", "Cheri", "Cherianne", "Cherice", "Cherida", "Cherie", "Cherilyn", "Cherilynn", "Cherin", "Cherise", "Cherish", "Cherlyn", "Cherri", "Cherrita", "Cherry", "Chery", "Cherye", "Cheryl", "Cheslie", "Chiarra", "Chickie", "Chicky", "Chiquia", "Chiquita", "Chlo", "Chloe", "Chloette", "Chloris", "Chris", "Chrissie", "Chrissy", "Christa", "Christabel", "Christabella", "Christal", "Christalle", "Christan", "Christean", "Christel", "Christen", "Christi", "Christian", "Christiana", "Christiane", "Christie", "Christin", "Christina", "Christine", "Christy", "Christye", "Christyna", "Chrysa", "Chrysler", "Chrystal", "Chryste", "Chrystel", "Cicely", "Cicily", "Ciel", "Cilka", "Cinda", "Cindee", "Cindelyn", "Cinderella", "Cindi", "Cindie", "Cindra", "Cindy", "Cinnamon", "Cissiee", "Cissy", "Clair", "Claire", "Clara", "Clarabelle", "Clare", "Claresta", "Clareta", "Claretta", "Clarette", "Clarey", "Clari", "Claribel", "Clarice", "Clarie", "Clarinda", "Clarine", "Clarissa", "Clarisse", "Clarita", "Clary", "Claude", "Claudelle", "Claudetta", "Claudette", "Claudia", "Claudie", "Claudina", "Claudine", "Clea", "Clem", "Clemence", "Clementia", "Clementina", "Clementine", "Clemmie", "Clemmy", "Cleo", "Cleopatra", "Clerissa", "Clio", "Clo", "Cloe", "Cloris", "Clotilda", "Clovis", "Codee", "Codi", "Codie", "Cody", "Coleen", "Colene", "Coletta", "Colette", "Colleen", "Collen", "Collete", "Collette", "Collie", "Colline", "Colly", "Con", "Concettina", "Conchita", "Concordia", "Conni", "Connie", "Conny", "Consolata", "Constance", "Constancia", "Constancy", "Constanta", "Constantia", "Constantina", "Constantine", "Consuela", "Consuelo", "Cookie", "Cora", "Corabel", "Corabella", "Corabelle", "Coral", "Coralie", "Coraline", "Coralyn", "Cordelia", "Cordelie", "Cordey", "Cordi", "Cordie", "Cordula", "Cordy", "Coreen", "Corella", "Corenda", "Corene", "Coretta", "Corette", "Corey", "Cori", "Corie", "Corilla", "Corina", "Corine", "Corinna", "Corinne", "Coriss", "Corissa", "Corliss", "Corly", "Cornela", "Cornelia", "Cornelle", "Cornie", "Corny", "Correna", "Correy", "Corri", "Corrianne", "Corrie", "Corrina", "Corrine", "Corrinne", "Corry", "Cortney", "Cory", "Cosetta", "Cosette", "Costanza", "Courtenay", "Courtnay", "Courtney", "Crin", "Cris", "Crissie", "Crissy", "Crista", "Cristabel", "Cristal", "Cristen", "Cristi", "Cristie", "Cristin", "Cristina", "Cristine", "Cristionna", "Cristy", "Crysta", "Crystal", "Crystie", "Cthrine", "Cyb", "Cybil", "Cybill", "Cymbre", "Cynde", "Cyndi", "Cyndia", "Cyndie", "Cyndy", "Cynthea", "Cynthia", "Cynthie", "Cynthy", "Dacey", "Dacia", "Dacie", "Dacy", "Dael", "Daffi", "Daffie", "Daffy", "Dagmar", "Dahlia", "Daile", "Daisey", "Daisi", "Daisie", "Daisy", "Dale", "Dalenna", "Dalia", "Dalila", "Dallas", "Daloris", "Damara", "Damaris", "Damita", "Dana", "Danell", "Danella", "Danette", "Dani", "Dania", "Danica", "Danice", "Daniela", "Daniele", "Daniella", "Danielle", "Danika", "Danila", "Danit", "Danita", "Danna", "Danni", "Dannie", "Danny", "Dannye", "Danya", "Danyelle", "Danyette", "Daphene", "Daphna", "Daphne", "Dara", "Darb", "Darbie", "Darby", "Darcee", "Darcey", "Darci", "Darcie", "Darcy", "Darda", "Dareen", "Darell", "Darelle", "Dari", "Daria", "Darice", "Darla", "Darleen", "Darlene", "Darline", "Darlleen", "Daron", "Darrelle", "Darryl", "Darsey", "Darsie", "Darya", "Daryl", "Daryn", "Dasha", "Dasi", "Dasie", "Dasya", "Datha", "Daune", "Daveen", "Daveta", "Davida", "Davina", "Davine", "Davita", "Dawn", "Dawna", "Dayle", "Dayna", "Ddene", "De", "Deana", "Deane", "Deanna", "Deanne", "Deb", "Debbi", "Debbie", "Debby", "Debee", "Debera", "Debi", "Debor", "Debora", "Deborah", "Debra", "Dede", "Dedie", "Dedra", "Dee", "Deeann", "Deeanne", "Deedee", "Deena", "Deerdre", "Deeyn", "Dehlia", "Deidre", "Deina", "Deirdre", "Del", "Dela", "Delcina", "Delcine", "Delia", "Delila", "Delilah", "Delinda", "Dell", "Della", "Delly", "Delora", "Delores", "Deloria", "Deloris", "Delphine", "Delphinia", "Demeter", "Demetra", "Demetria", "Demetris", "Dena", "Deni", "Denice", "Denise", "Denna", "Denni", "Dennie", "Denny", "Deny", "Denys", "Denyse", "Deonne", "Desdemona", "Desirae", "Desiree", "Desiri", "Deva", "Devan", "Devi", "Devin", "Devina", "Devinne", "Devon", "Devondra", "Devonna", "Devonne", "Devora", "Di", "Diahann", "Dian", "Diana", "Diandra", "Diane", "Diane-marie", "Dianemarie", "Diann", "Dianna", "Dianne", "Diannne", "Didi", "Dido", "Diena", "Dierdre", "Dina", "Dinah", "Dinnie", "Dinny", "Dion", "Dione", "Dionis", "Dionne", "Dita", "Dix", "Dixie", "Dniren", "Dode", "Dodi", "Dodie", "Dody", "Doe", "Doll", "Dolley", "Dolli", "Dollie", "Dolly", "Dolores", "Dolorita", "Doloritas", "Domeniga", "Dominga", "Domini", "Dominica", "Dominique", "Dona", "Donella", "Donelle", "Donetta", "Donia", "Donica", "Donielle", "Donna", "Donnamarie", "Donni", "Donnie", "Donny", "Dora", "Doralia", "Doralin", "Doralyn", "Doralynn", "Doralynne", "Dore", "Doreen", "Dorelia", "Dorella", "Dorelle", "Dorena", "Dorene", "Doretta", "Dorette", "Dorey", "Dori", "Doria", "Dorian", "Dorice", "Dorie", "Dorine", "Doris", "Dorisa", "Dorise", "Dorita", "Doro", "Dorolice", "Dorolisa", "Dorotea", "Doroteya", "Dorothea", "Dorothee", "Dorothy", "Dorree", "Dorri", "Dorrie", "Dorris", "Dorry", "Dorthea", "Dorthy", "Dory", "Dosi", "Dot", "Doti", "Dotti", "Dottie", "Dotty", "Dre", "Dreddy", "Dredi", "Drona", "Dru", "Druci", "Drucie", "Drucill", "Drucy", "Drusi", "Drusie", "Drusilla", "Drusy", "Dulce", "Dulcea", "Dulci", "Dulcia", "Dulciana", "Dulcie", "Dulcine", "Dulcinea", "Dulcy", "Dulsea", "Dusty", "Dyan", "Dyana", "Dyane", "Dyann", "Dyanna", "Dyanne", "Dyna", "Dynah", "Eachelle", "Eada", "Eadie", "Eadith", "Ealasaid", "Eartha", "Easter", "Eba", "Ebba", "Ebonee", "Ebony", "Eda", "Eddi", "Eddie", "Eddy", "Ede", "Edee", "Edeline", "Eden", "Edi", "Edie", "Edin", "Edita", "Edith", "Editha", "Edithe", "Ediva", "Edna", "Edwina", "Edy", "Edyth", "Edythe", "Effie", "Eileen", "Eilis", "Eimile", "Eirena", "Ekaterina", "Elaina", "Elaine", "Elana", "Elane", "Elayne", "Elberta", "Elbertina", "Elbertine", "Eleanor", "Eleanora", "Eleanore", "Electra", "Eleen", "Elena", "Elene", "Eleni", "Elenore", "Eleonora", "Eleonore", "Elfie", "Elfreda", "Elfrida", "Elfrieda", "Elga", "Elianora", "Elianore", "Elicia", "Elie", "Elinor", "Elinore", "Elisa", "Elisabet", "Elisabeth", "Elisabetta", "Elise", "Elisha", "Elissa", "Elita", "Eliza", "Elizabet", "Elizabeth", "Elka", "Elke", "Ella", "Elladine", "Elle", "Ellen", "Ellene", "Ellette", "Elli", "Ellie", "Ellissa", "Elly", "Ellyn", "Ellynn", "Elmira", "Elna", "Elnora", "Elnore", "Eloisa", "Eloise", "Elonore", "Elora", "Elsa", "Elsbeth", "Else", "Elset", "Elsey", "Elsi", "Elsie", "Elsinore", "Elspeth", "Elsy", "Elva", "Elvera", "Elvina", "Elvira", "Elwira", "Elyn", "Elyse", "Elysee", "Elysha", "Elysia", "Elyssa", "Em", "Ema", "Emalee", "Emalia", "Emelda", "Emelia", "Emelina", "Emeline", "Emelita", "Emelyne", "Emera", "Emilee", "Emili", "Emilia", "Emilie", "Emiline", "Emily", "Emlyn", "Emlynn", "Emlynne", "Emma", "Emmalee", "Emmaline", "Emmalyn", "Emmalynn", "Emmalynne", "Emmeline", "Emmey", "Emmi", "Emmie", "Emmy", "Emmye", "Emogene", "Emyle", "Emylee", "Engracia", "Enid", "Enrica", "Enrichetta", "Enrika", "Enriqueta", "Eolanda", "Eolande", "Eran", "Erda", "Erena", "Erica", "Ericha", "Ericka", "Erika", "Erin", "Erina", "Erinn", "Erinna", "Erma", "Ermengarde", "Ermentrude", "Ermina", "Erminia", "Erminie", "Erna", "Ernaline", "Ernesta", "Ernestine", "Ertha", "Eryn", "Esma", "Esmaria", "Esme", "Esmeralda", "Essa", "Essie", "Essy", "Esta", "Estel", "Estele", "Estell", "Estella", "Estelle", "Ester", "Esther", "Estrella", "Estrellita", "Ethel", "Ethelda", "Ethelin", "Ethelind", "Etheline", "Ethelyn", "Ethyl", "Etta", "Etti", "Ettie", "Etty", "Eudora", "Eugenia", "Eugenie", "Eugine", "Eula", "Eulalie", "Eunice", "Euphemia", "Eustacia", "Eva", "Evaleen", "Evangelia", "Evangelin", "Evangelina", "Evangeline", "Evania", "Evanne", "Eve", "Eveleen", "Evelina", "Eveline", "Evelyn", "Evey", "Evie", "Evita", "Evonne", "Evvie", "Evvy", "Evy", "Eyde", "Eydie", "Ezmeralda", "Fae", "Faina", "Faith", "Fallon", "Fan", "Fanchette", "Fanchon", "Fancie", "Fancy", "Fanechka", "Fania", "Fanni", "Fannie", "Fanny", "Fanya", "Fara", "Farah", "Farand", "Farica", "Farra", "Farrah", "Farrand", "Faun", "Faunie", "Faustina", "Faustine", "Fawn", "Fawne", "Fawnia", "Fay", "Faydra", "Faye", "Fayette", "Fayina", "Fayre", "Fayth", "Faythe", "Federica", "Fedora", "Felecia", "Felicdad", "Felice", "Felicia", "Felicity", "Felicle", "Felipa", "Felisha", "Felita", "Feliza", "Fenelia", "Feodora", "Ferdinanda", "Ferdinande", "Fern", "Fernanda", "Fernande", "Fernandina", "Ferne", "Fey", "Fiann", "Fianna", "Fidela", "Fidelia", "Fidelity", "Fifi", "Fifine", "Filia", "Filide", "Filippa", "Fina", "Fiona", "Fionna", "Fionnula", "Fiorenze", "Fleur", "Fleurette", "Flo", "Flor", "Flora", "Florance", "Flore", "Florella", "Florence", "Florencia", "Florentia", "Florenza", "Florette", "Flori", "Floria", "Florida", "Florie", "Florina", "Florinda", "Floris", "Florri", "Florrie", "Florry", "Flory", "Flossi", "Flossie", "Flossy", "Flss", "Fran", "Francene", "Frances", "Francesca", "Francine", "Francisca", "Franciska", "Francoise", "Francyne", "Frank", "Frankie", "Franky", "Franni", "Frannie", "Franny", "Frayda", "Fred", "Freda", "Freddi", "Freddie", "Freddy", "Fredelia", "Frederica", "Fredericka", "Frederique", "Fredi", "Fredia", "Fredra", "Fredrika", "Freida", "Frieda", "Friederike", "Fulvia", "Gabbey", "Gabbi", "Gabbie", "Gabey", "Gabi", "Gabie", "Gabriel", "Gabriela", "Gabriell", "Gabriella", "Gabrielle", "Gabriellia", "Gabrila", "Gaby", "Gae", "Gael", "Gail", "Gale", "Galina", "Garland", "Garnet", "Garnette", "Gates", "Gavra", "Gavrielle", "Gay", "Gaye", "Gayel", "Gayla", "Gayle", "Gayleen", "Gaylene", "Gaynor", "Gelya", "Gena", "Gene", "Geneva", "Genevieve", "Genevra", "Genia", "Genna", "Genni", "Gennie", "Gennifer", "Genny", "Genovera", "Genvieve", "George", "Georgeanna", "Georgeanne", "Georgena", "Georgeta", "Georgetta", "Georgette", "Georgia", "Georgiana", "Georgianna", "Georgianne", "Georgie", "Georgina", "Georgine", "Geralda", "Geraldine", "Gerda", "Gerhardine", "Geri", "Gerianna", "Gerianne", "Gerladina", "Germain", "Germaine", "Germana", "Gerri", "Gerrie", "Gerrilee", "Gerry", "Gert", "Gerta", "Gerti", "Gertie", "Gertrud", "Gertruda", "Gertrude", "Gertrudis", "Gerty", "Giacinta", "Giana", "Gianina", "Gianna", "Gigi", "Gilberta", "Gilberte", "Gilbertina", "Gilbertine", "Gilda", "Gilemette", "Gill", "Gillan", "Gilli", "Gillian", "Gillie", "Gilligan", "Gilly", "Gina", "Ginelle", "Ginevra", "Ginger", "Ginni", "Ginnie", "Ginnifer", "Ginny", "Giorgia", "Giovanna", "Gipsy", "Giralda", "Gisela", "Gisele", "Gisella", "Giselle", "Giuditta", "Giulia", "Giulietta", "Giustina", "Gizela", "Glad", "Gladi", "Gladys", "Gleda", "Glen", "Glenda", "Glenine", "Glenn", "Glenna", "Glennie", "Glennis", "Glori", "Gloria", "Gloriana", "Gloriane", "Glory", "Glyn", "Glynda", "Glynis", "Glynnis", "Gnni", "Godiva", "Golda", "Goldarina", "Goldi", "Goldia", "Goldie", "Goldina", "Goldy", "Grace", "Gracia", "Gracie", "Grata", "Gratia", "Gratiana", "Gray", "Grayce", "Grazia", "Greer", "Greta", "Gretal", "Gretchen", "Grete", "Gretel", "Grethel", "Gretna", "Gretta", "Grier", "Griselda", "Grissel", "Guendolen", "Guenevere", "Guenna", "Guglielma", "Gui", "Guillema", "Guillemette", "Guinevere", "Guinna", "Gunilla", "Gus", "Gusella", "Gussi", "Gussie", "Gussy", "Gusta", "Gusti", "Gustie", "Gusty", "Gwen", "Gwendolen", "Gwendolin", "Gwendolyn", "Gweneth", "Gwenette", "Gwenneth", "Gwenni", "Gwennie", "Gwenny", "Gwenora", "Gwenore", "Gwyn", "Gwyneth", "Gwynne", "Gypsy", "Hadria", "Hailee", "Haily", "Haleigh", "Halette", "Haley", "Hali", "Halie", "Halimeda", "Halley", "Halli", "Hallie", "Hally", "Hana", "Hanna", "Hannah", "Hanni", "Hannie", "Hannis", "Hanny", "Happy", "Harlene", "Harley", "Harli", "Harlie", "Harmonia", "Harmonie", "Harmony", "Harri", "Harrie", "Harriet", "Harriett", "Harrietta", "Harriette", "Harriot", "Harriott", "Hatti", "Hattie", "Hatty", "Hayley", "Hazel", "Heath", "Heather", "Heda", "Hedda", "Heddi", "Heddie", "Hedi", "Hedvig", "Hedvige", "Hedwig", "Hedwiga", "Hedy", "Heida", "Heidi", "Heidie", "Helaina", "Helaine", "Helen", "Helen-elizabeth", "Helena", "Helene", "Helenka", "Helga", "Helge", "Helli", "Heloise", "Helsa", "Helyn", "Hendrika", "Henka", "Henrie", "Henrieta", "Henrietta", "Henriette", "Henryetta", "Hephzibah", "Hermia", "Hermina", "Hermine", "Herminia", "Hermione", "Herta", "Hertha", "Hester", "Hesther", "Hestia", "Hetti", "Hettie", "Hetty", "Hilary", "Hilda", "Hildagard", "Hildagarde", "Hilde", "Hildegaard", "Hildegarde", "Hildy", "Hillary", "Hilliary", "Hinda", "Holli", "Hollie", "Holly", "Holly-anne", "Hollyanne", "Honey", "Honor", "Honoria", "Hope", "Horatia", "Hortense", "Hortensia", "Hulda", "Hyacinth", "Hyacintha", "Hyacinthe", "Hyacinthia", "Hyacinthie", "Hynda", "Ianthe", "Ibbie", "Ibby", "Ida", "Idalia", "Idalina", "Idaline", "Idell", "Idelle", "Idette", "Ileana", "Ileane", "Ilene", "Ilise", "Ilka", "Illa", "Ilsa", "Ilse", "Ilysa", "Ilyse", "Ilyssa", "Imelda", "Imogen", "Imogene", "Imojean", "Ina", "Indira", "Ines", "Inesita", "Inessa", "Inez", "Inga", "Ingaberg", "Ingaborg", "Inge", "Ingeberg", "Ingeborg", "Inger", "Ingrid", "Ingunna", "Inna", "Iolande", "Iolanthe", "Iona", "Iormina", "Ira", "Irena", "Irene", "Irina", "Iris", "Irita", "Irma", "Isa", "Isabel", "Isabelita", "Isabella", "Isabelle", "Isadora", "Isahella", "Iseabal", "Isidora", "Isis", "Isobel", "Issi", "Issie", "Issy", "Ivett", "Ivette", "Ivie", "Ivonne", "Ivory", "Ivy", "Izabel", "Jacenta", "Jacinda", "Jacinta", "Jacintha", "Jacinthe", "Jackelyn", "Jacki", "Jackie", "Jacklin", "Jacklyn", "Jackquelin", "Jackqueline", "Jacky", "Jaclin", "Jaclyn", "Jacquelin", "Jacqueline", "Jacquelyn", "Jacquelynn", "Jacquenetta", "Jacquenette", "Jacquetta", "Jacquette", "Jacqui", "Jacquie", "Jacynth", "Jada", "Jade", "Jaime", "Jaimie", "Jaine", "Jami", "Jamie", "Jamima", "Jammie", "Jan", "Jana", "Janaya", "Janaye", "Jandy", "Jane", "Janean", "Janeczka", "Janeen", "Janel", "Janela", "Janella", "Janelle", "Janene", "Janenna", "Janessa", "Janet", "Janeta", "Janetta", "Janette", "Janeva", "Janey", "Jania", "Janice", "Janie", "Janifer", "Janina", "Janine", "Janis", "Janith", "Janka", "Janna", "Jannel", "Jannelle", "Janot", "Jany", "Jaquelin", "Jaquelyn", "Jaquenetta", "Jaquenette", "Jaquith", "Jasmin", "Jasmina", "Jasmine", "Jayme", "Jaymee", "Jayne", "Jaynell", "Jazmin", "Jean", "Jeana", "Jeane", "Jeanelle", "Jeanette", "Jeanie", "Jeanine", "Jeanna", "Jeanne", "Jeannette", "Jeannie", "Jeannine", "Jehanna", "Jelene", "Jemie", "Jemima", "Jemimah", "Jemmie", "Jemmy", "Jen", "Jena", "Jenda", "Jenelle", "Jeni", "Jenica", "Jeniece", "Jenifer", "Jeniffer", "Jenilee", "Jenine", "Jenn", "Jenna", "Jennee", "Jennette", "Jenni", "Jennica", "Jennie", "Jennifer", "Jennilee", "Jennine", "Jenny", "Jeralee", "Jere", "Jeri", "Jermaine", "Jerrie", "Jerrilee", "Jerrilyn", "Jerrine", "Jerry", "Jerrylee", "Jess", "Jessa", "Jessalin", "Jessalyn", "Jessamine", "Jessamyn", "Jesse", "Jesselyn", "Jessi", "Jessica", "Jessie", "Jessika", "Jessy", "Jewel", "Jewell", "Jewelle", "Jill", "Jillana", "Jillane", "Jillayne", "Jilleen", "Jillene", "Jilli", "Jillian", "Jillie", "Jilly", "Jinny", "Jo", "Jo-ann", "Jo-anne", "Joan", "Joana", "Joane", "Joanie", "Joann", "Joanna", "Joanne", "Joannes", "Jobey", "Jobi", "Jobie", "Jobina", "Joby", "Jobye", "Jobyna", "Jocelin", "Joceline", "Jocelyn", "Jocelyne", "Jodee", "Jodi", "Jodie", "Jody", "Joeann", "Joela", "Joelie", "Joell", "Joella", "Joelle", "Joellen", "Joelly", "Joellyn", "Joelynn", "Joete", "Joey", "Johanna", "Johannah", "Johna", "Johnath", "Johnette", "Johnna", "Joice", "Jojo", "Jolee", "Joleen", "Jolene", "Joletta", "Joli", "Jolie", "Joline", "Joly", "Jolyn", "Jolynn", "Jonell", "Joni", "Jonie", "Jonis", "Jordain", "Jordan", "Jordana", "Jordanna", "Jorey", "Jori", "Jorie", "Jorrie", "Jorry", "Joscelin", "Josee", "Josefa", "Josefina", "Josepha", "Josephina", "Josephine", "Josey", "Josi", "Josie", "Josselyn", "Josy", "Jourdan", "Joy", "Joya", "Joyan", "Joyann", "Joyce", "Joycelin", "Joye", "Jsandye", "Juana", "Juanita", "Judi", "Judie", "Judith", "Juditha", "Judy", "Judye", "Juieta", "Julee", "Juli", "Julia", "Juliana", "Juliane", "Juliann", "Julianna", "Julianne", "Julie", "Julienne", "Juliet", "Julieta", "Julietta", "Juliette", "Julina", "Juline", "Julissa", "Julita", "June", "Junette", "Junia", "Junie", "Junina", "Justina", "Justine", "Justinn", "Jyoti", "Kacey", "Kacie", "Kacy", "Kaela", "Kai", "Kaia", "Kaila", "Kaile", "Kailey", "Kaitlin", "Kaitlyn", "Kaitlynn", "Kaja", "Kakalina", "Kala", "Kaleena", "Kali", "Kalie", "Kalila", "Kalina", "Kalinda", "Kalindi", "Kalli", "Kally", "Kameko", "Kamila", "Kamilah", "Kamillah", "Kandace", "Kandy", "Kania", "Kanya", "Kara", "Kara-lynn", "Karalee", "Karalynn", "Kare", "Karee", "Karel", "Karen", "Karena", "Kari", "Karia", "Karie", "Karil", "Karilynn", "Karin", "Karina", "Karine", "Kariotta", "Karisa", "Karissa", "Karita", "Karla", "Karlee", "Karleen", "Karlen", "Karlene", "Karlie", "Karlotta", "Karlotte", "Karly", "Karlyn", "Karmen", "Karna", "Karol", "Karola", "Karole", "Karolina", "Karoline", "Karoly", "Karon", "Karrah", "Karrie", "Karry", "Kary", "Karyl", "Karylin", "Karyn", "Kasey", "Kass", "Kassandra", "Kassey", "Kassi", "Kassia", "Kassie", "Kat", "Kata", "Katalin", "Kate", "Katee", "Katerina", "Katerine", "Katey", "Kath", "Katha", "Katharina", "Katharine", "Katharyn", "Kathe", "Katherina", "Katherine", "Katheryn", "Kathi", "Kathie", "Kathleen", "Kathlin", "Kathrine", "Kathryn", "Kathryne", "Kathy", "Kathye", "Kati", "Katie", "Katina", "Katine", "Katinka", "Katleen", "Katlin", "Katrina", "Katrine", "Katrinka", "Katti", "Kattie", "Katuscha", "Katusha", "Katy", "Katya", "Kay", "Kaycee", "Kaye", "Kayla", "Kayle", "Kaylee", "Kayley", "Kaylil", "Kaylyn", "Keeley", "Keelia", "Keely", "Kelcey", "Kelci", "Kelcie", "Kelcy", "Kelila", "Kellen", "Kelley", "Kelli", "Kellia", "Kellie", "Kellina", "Kellsie", "Kelly", "Kellyann", "Kelsey", "Kelsi", "Kelsy", "Kendra", "Kendre", "Kenna", "Keri", "Keriann", "Kerianne", "Kerri", "Kerrie", "Kerrill", "Kerrin", "Kerry", "Kerstin", "Kesley", "Keslie", "Kessia", "Kessiah", "Ketti", "Kettie", "Ketty", "Kevina", "Kevyn", "Ki", "Kiah", "Kial", "Kiele", "Kiersten", "Kikelia", "Kiley", "Kim", "Kimberlee", "Kimberley", "Kimberli", "Kimberly", "Kimberlyn", "Kimbra", "Kimmi", "Kimmie", "Kimmy", "Kinna", "Kip", "Kipp", "Kippie", "Kippy", "Kira", "Kirbee", "Kirbie", "Kirby", "Kiri", "Kirsten", "Kirsteni", "Kirsti", "Kirstin", "Kirstyn", "Kissee", "Kissiah", "Kissie", "Kit", "Kitti", "Kittie", "Kitty", "Kizzee", "Kizzie", "Klara", "Klarika", "Klarrisa", "Konstance", "Konstanze", "Koo", "Kora", "Koral", "Koralle", "Kordula", "Kore", "Korella", "Koren", "Koressa", "Kori", "Korie", "Korney", "Korrie", "Korry", "Kris", "Krissie", "Krissy", "Krista", "Kristal", "Kristan", "Kriste", "Kristel", "Kristen", "Kristi", "Kristien", "Kristin", "Kristina", "Kristine", "Kristy", "Kristyn", "Krysta", "Krystal", "Krystalle", "Krystle", "Krystyna", "Kyla", "Kyle", "Kylen", "Kylie", "Kylila", "Kylynn", "Kym", "Kynthia", "Kyrstin", "Lacee", "Lacey", "Lacie", "Lacy", "Ladonna", "Laetitia", "Laina", "Lainey", "Lana", "Lanae", "Lane", "Lanette", "Laney", "Lani", "Lanie", "Lanita", "Lanna", "Lanni", "Lanny", "Lara", "Laraine", "Lari", "Larina", "Larine", "Larisa", "Larissa", "Lark", "Laryssa", "Latashia", "Latia", "Latisha", "Latrena", "Latrina", "Laura", "Lauraine", "Laural", "Lauralee", "Laure", "Lauree", "Laureen", "Laurel", "Laurella", "Lauren", "Laurena", "Laurene", "Lauretta", "Laurette", "Lauri", "Laurianne", "Laurice", "Laurie", "Lauryn", "Lavena", "Laverna", "Laverne", "Lavina", "Lavinia", "Lavinie", "Layla", "Layne", "Layney", "Lea", "Leah", "Leandra", "Leann", "Leanna", "Leanor", "Leanora", "Lebbie", "Leda", "Lee", "Leeann", "Leeanne", "Leela", "Leelah", "Leena", "Leesa", "Leese", "Legra", "Leia", "Leigh", "Leigha", "Leila", "Leilah", "Leisha", "Lela", "Lelah", "Leland", "Lelia", "Lena", "Lenee", "Lenette", "Lenka", "Lenna", "Lenora", "Lenore", "Leodora", "Leoine", "Leola", "Leoline", "Leona", "Leonanie", "Leone", "Leonelle", "Leonie", "Leonora", "Leonore", "Leontine", "Leontyne", "Leora", "Leshia", "Lesley", "Lesli", "Leslie", "Lesly", "Lesya", "Leta", "Lethia", "Leticia", "Letisha", "Letitia", "Letizia", "Letta", "Letti", "Lettie", "Letty", "Lexi", "Lexie", "Lexine", "Lexis", "Lexy", "Leyla", "Lezlie", "Lia", "Lian", "Liana", "Liane", "Lianna", "Lianne", "Lib", "Libbey", "Libbi", "Libbie", "Libby", "Licha", "Lida", "Lidia", "Liesa", "Lil", "Lila", "Lilah", "Lilas", "Lilia", "Lilian", "Liliane", "Lilias", "Lilith", "Lilla", "Lilli", "Lillian", "Lillis", "Lilllie", "Lilly", "Lily", "Lilyan", "Lin", "Lina", "Lind", "Linda", "Lindi", "Lindie", "Lindsay", "Lindsey", "Lindsy", "Lindy", "Linea", "Linell", "Linet", "Linette", "Linn", "Linnea", "Linnell", "Linnet", "Linnie", "Linzy", "Lira", "Lisa", "Lisabeth", "Lisbeth", "Lise", "Lisetta", "Lisette", "Lisha", "Lishe", "Lissa", "Lissi", "Lissie", "Lissy", "Lita", "Liuka", "Liv", "Liva", "Livia", "Livvie", "Livvy", "Livvyy", "Livy", "Liz", "Liza", "Lizabeth", "Lizbeth", "Lizette", "Lizzie", "Lizzy", "Loella", "Lois", "Loise", "Lola", "Loleta", "Lolita", "Lolly", "Lona", "Lonee", "Loni", "Lonna", "Lonni", "Lonnie", "Lora", "Lorain", "Loraine", "Loralee", "Loralie", "Loralyn", "Loree", "Loreen", "Lorelei", "Lorelle", "Loren", "Lorena", "Lorene", "Lorenza", "Loretta", "Lorette", "Lori", "Loria", "Lorianna", "Lorianne", "Lorie", "Lorilee", "Lorilyn", "Lorinda", "Lorine", "Lorita", "Lorna", "Lorne", "Lorraine", "Lorrayne", "Lorri", "Lorrie", "Lorrin", "Lorry", "Lory", "Lotta", "Lotte", "Lotti", "Lottie", "Lotty", "Lou", "Louella", "Louisa", "Louise", "Louisette", "Loutitia", "Lu", "Luce", "Luci", "Lucia", "Luciana", "Lucie", "Lucienne", "Lucila", "Lucilia", "Lucille", "Lucina", "Lucinda", "Lucine", "Lucita", "Lucky", "Lucretia", "Lucy", "Ludovika", "Luella", "Luelle", "Luisa", "Luise", "Lula", "Lulita", "Lulu", "Lura", "Lurette", "Lurleen", "Lurlene", "Lurline", "Lusa", "Luz", "Lyda", "Lydia", "Lydie", "Lyn", "Lynda", "Lynde", "Lyndel", "Lyndell", "Lyndsay", "Lyndsey", "Lyndsie", "Lyndy", "Lynea", "Lynelle", "Lynett", "Lynette", "Lynn", "Lynna", "Lynne", "Lynnea", "Lynnell", "Lynnelle", "Lynnet", "Lynnett", "Lynnette", "Lynsey", "Lyssa", "Mab", "Mabel", "Mabelle", "Mable", "Mada", "Madalena", "Madalyn", "Maddalena", "Maddi", "Maddie", "Maddy", "Madel", "Madelaine", "Madeleine", "Madelena", "Madelene", "Madelin", "Madelina", "Madeline", "Madella", "Madelle", "Madelon", "Madelyn", "Madge", "Madlen", "Madlin", "Madonna", "Mady", "Mae", "Maegan", "Mag", "Magda", "Magdaia", "Magdalen", "Magdalena", "Magdalene", "Maggee", "Maggi", "Maggie", "Maggy", "Mahala", "Mahalia", "Maia", "Maible", "Maiga", "Maighdiln", "Mair", "Maire", "Maisey", "Maisie", "Maitilde", "Mala", "Malanie", "Malena", "Malia", "Malina", "Malinda", "Malinde", "Malissa", "Malissia", "Mallissa", "Mallorie", "Mallory", "Malorie", "Malory", "Malva", "Malvina", "Malynda", "Mame", "Mamie", "Manda", "Mandi", "Mandie", "Mandy", "Manon", "Manya", "Mara", "Marabel", "Marcela", "Marcelia", "Marcella", "Marcelle", "Marcellina", "Marcelline", "Marchelle", "Marci", "Marcia", "Marcie", "Marcile", "Marcille", "Marcy", "Mareah", "Maren", "Marena", "Maressa", "Marga", "Margalit", "Margalo", "Margaret", "Margareta", "Margarete", "Margaretha", "Margarethe", "Margaretta", "Margarette", "Margarita", "Margaux", "Marge", "Margeaux", "Margery", "Marget", "Margette", "Margi", "Margie", "Margit", "Margo", "Margot", "Margret", "Marguerite", "Margy", "Mari", "Maria", "Mariam", "Marian", "Mariana", "Mariann", "Marianna", "Marianne", "Maribel", "Maribelle", "Maribeth", "Marice", "Maridel", "Marie", "Marie-ann", "Marie-jeanne", "Marieann", "Mariejeanne", "Mariel", "Mariele", "Marielle", "Mariellen", "Marietta", "Mariette", "Marigold", "Marijo", "Marika", "Marilee", "Marilin", "Marillin", "Marilyn", "Marin", "Marina", "Marinna", "Marion", "Mariquilla", "Maris", "Marisa", "Mariska", "Marissa", "Marita", "Maritsa", "Mariya", "Marj", "Marja", "Marje", "Marji", "Marjie", "Marjorie", "Marjory", "Marjy", "Marketa", "Marla", "Marlane", "Marleah", "Marlee", "Marleen", "Marlena", "Marlene", "Marley", "Marlie", "Marline", "Marlo", "Marlyn", "Marna", "Marne", "Marney", "Marni", "Marnia", "Marnie", "Marquita", "Marrilee", "Marris", "Marrissa", "Marsha", "Marsiella", "Marta", "Martelle", "Martguerita", "Martha", "Marthe", "Marthena", "Marti", "Martica", "Martie", "Martina", "Martita", "Marty", "Martynne", "Mary", "Marya", "Maryann", "Maryanna", "Maryanne", "Marybelle", "Marybeth", "Maryellen", "Maryjane", "Maryjo", "Maryl", "Marylee", "Marylin", "Marylinda", "Marylou", "Marylynne", "Maryrose", "Marys", "Marysa", "Masha", "Matelda", "Mathilda", "Mathilde", "Matilda", "Matilde", "Matti", "Mattie", "Matty", "Maud", "Maude", "Maudie", "Maura", "Maure", "Maureen", "Maureene", "Maurene", "Maurine", "Maurise", "Maurita", "Maurizia", "Mavis", "Mavra", "Max", "Maxi", "Maxie", "Maxine", "Maxy", "May", "Maybelle", "Maye", "Mead", "Meade", "Meagan", "Meaghan", "Meara", "Mechelle", "Meg", "Megan", "Megen", "Meggi", "Meggie", "Meggy", "Meghan", "Meghann", "Mehetabel", "Mei", "Mel", "Mela", "Melamie", "Melania", "Melanie", "Melantha", "Melany", "Melba", "Melesa", "Melessa", "Melicent", "Melina", "Melinda", "Melinde", "Melisa", "Melisande", "Melisandra", "Melisenda", "Melisent", "Melissa", "Melisse", "Melita", "Melitta", "Mella", "Melli", "Mellicent", "Mellie", "Mellisa", "Mellisent", "Melloney", "Melly", "Melodee", "Melodie", "Melody", "Melonie", "Melony", "Melosa", "Melva", "Mercedes", "Merci", "Mercie", "Mercy", "Meredith", "Meredithe", "Meridel", "Meridith", "Meriel", "Merilee", "Merilyn", "Meris", "Merissa", "Merl", "Merla", "Merle", "Merlina", "Merline", "Merna", "Merola", "Merralee", "Merridie", "Merrie", "Merrielle", "Merrile", "Merrilee", "Merrili", "Merrill", "Merrily", "Merry", "Mersey", "Meryl", "Meta", "Mia", "Micaela", "Michaela", "Michaelina", "Michaeline", "Michaella", "Michal", "Michel", "Michele", "Michelina", "Micheline", "Michell", "Michelle", "Micki", "Mickie", "Micky", "Midge", "Mignon", "Mignonne", "Miguela", "Miguelita", "Mikaela", "Mil", "Mildred", "Mildrid", "Milena", "Milicent", "Milissent", "Milka", "Milli", "Millicent", "Millie", "Millisent", "Milly", "Milzie", "Mimi", "Min", "Mina", "Minda", "Mindy", "Minerva", "Minetta", "Minette", "Minna", "Minnaminnie", "Minne", "Minni", "Minnie", "Minnnie", "Minny", "Minta", "Miquela", "Mira", "Mirabel", "Mirabella", "Mirabelle", "Miran", "Miranda", "Mireielle", "Mireille", "Mirella", "Mirelle", "Miriam", "Mirilla", "Mirna", "Misha", "Missie", "Missy", "Misti", "Misty", "Mitzi", "Modesta", "Modestia", "Modestine", "Modesty", "Moina", "Moira", "Moll", "Mollee", "Molli", "Mollie", "Molly", "Mommy", "Mona", "Monah", "Monica", "Monika", "Monique", "Mora", "Moreen", "Morena", "Morgan", "Morgana", "Morganica", "Morganne", "Morgen", "Moria", "Morissa", "Morna", "Moselle", "Moyna", "Moyra", "Mozelle", "Muffin", "Mufi", "Mufinella", "Muire", "Mureil", "Murial", "Muriel", "Murielle", "Myra", "Myrah", "Myranda", "Myriam", "Myrilla", "Myrle", "Myrlene", "Myrna", "Myrta", "Myrtia", "Myrtice", "Myrtie", "Myrtle", "Nada", "Nadean", "Nadeen", "Nadia", "Nadine", "Nadiya", "Nady", "Nadya", "Nalani", "Nan", "Nana", "Nananne", "Nance", "Nancee", "Nancey", "Nanci", "Nancie", "Nancy", "Nanete", "Nanette", "Nani", "Nanice", "Nanine", "Nannette", "Nanni", "Nannie", "Nanny", "Nanon", "Naoma", "Naomi", "Nara", "Nari", "Nariko", "Nat", "Nata", "Natala", "Natalee", "Natalie", "Natalina", "Nataline", "Natalya", "Natasha", "Natassia", "Nathalia", "Nathalie", "Natividad", "Natka", "Natty", "Neala", "Neda", "Nedda", "Nedi", "Neely", "Neila", "Neile", "Neilla", "Neille", "Nelia", "Nelie", "Nell", "Nelle", "Nelli", "Nellie", "Nelly", "Nerissa", "Nerita", "Nert", "Nerta", "Nerte", "Nerti", "Nertie", "Nerty", "Nessa", "Nessi", "Nessie", "Nessy", "Nesta", "Netta", "Netti", "Nettie", "Nettle", "Netty", "Nevsa", "Neysa", "Nichol", "Nichole", "Nicholle", "Nicki", "Nickie", "Nicky", "Nicol", "Nicola", "Nicole", "Nicolea", "Nicolette", "Nicoli", "Nicolina", "Nicoline", "Nicolle", "Nikaniki", "Nike", "Niki", "Nikki", "Nikkie", "Nikoletta", "Nikolia", "Nina", "Ninetta", "Ninette", "Ninnetta", "Ninnette", "Ninon", "Nissa", "Nisse", "Nissie", "Nissy", "Nita", "Nixie", "Noami", "Noel", "Noelani", "Noell", "Noella", "Noelle", "Noellyn", "Noelyn", "Noemi", "Nola", "Nolana", "Nolie", "Nollie", "Nomi", "Nona", "Nonah", "Noni", "Nonie", "Nonna", "Nonnah", "Nora", "Norah", "Norean", "Noreen", "Norene", "Norina", "Norine", "Norma", "Norri", "Norrie", "Norry", "Novelia", "Nydia", "Nyssa", "Octavia", "Odele", "Odelia", "Odelinda", "Odella", "Odelle", "Odessa", "Odetta", "Odette", "Odilia", "Odille", "Ofelia", "Ofella", "Ofilia", "Ola", "Olenka", "Olga", "Olia", "Olimpia", "Olive", "Olivette", "Olivia", "Olivie", "Oliy", "Ollie", "Olly", "Olva", "Olwen", "Olympe", "Olympia", "Olympie", "Ondrea", "Oneida", "Onida", "Oona", "Opal", "Opalina", "Opaline", "Ophelia", "Ophelie", "Ora", "Oralee", "Oralia", "Oralie", "Oralla", "Oralle", "Orel", "Orelee", "Orelia", "Orelie", "Orella", "Orelle", "Oriana", "Orly", "Orsa", "Orsola", "Ortensia", "Otha", "Othelia", "Othella", "Othilia", "Othilie", "Ottilie", "Page", "Paige", "Paloma", "Pam", "Pamela", "Pamelina", "Pamella", "Pammi", "Pammie", "Pammy", "Pandora", "Pansie", "Pansy", "Paola", "Paolina", "Papagena", "Pat", "Patience", "Patrica", "Patrice", "Patricia", "Patrizia", "Patsy", "Patti", "Pattie", "Patty", "Paula", "Paule", "Pauletta", "Paulette", "Pauli", "Paulie", "Paulina", "Pauline", "Paulita", "Pauly", "Pavia", "Pavla", "Pearl", "Pearla", "Pearle", "Pearline", "Peg", "Pegeen", "Peggi", "Peggie", "Peggy", "Pen", "Penelopa", "Penelope", "Penni", "Pennie", "Penny", "Pepi", "Pepita", "Peri", "Peria", "Perl", "Perla", "Perle", "Perri", "Perrine", "Perry", "Persis", "Pet", "Peta", "Petra", "Petrina", "Petronella", "Petronia", "Petronilla", "Petronille", "Petunia", "Phaedra", "Phaidra", "Phebe", "Phedra", "Phelia", "Phil", "Philipa", "Philippa", "Philippe", "Philippine", "Philis", "Phillida", "Phillie", "Phillis", "Philly", "Philomena", "Phoebe", "Phylis", "Phyllida", "Phyllis", "Phyllys", "Phylys", "Pia", "Pier", "Pierette", "Pierrette", "Pietra", "Piper", "Pippa", "Pippy", "Polly", "Pollyanna", "Pooh", "Poppy", "Portia", "Pris", "Prisca", "Priscella", "Priscilla", "Prissie", "Pru", "Prudence", "Prudi", "Prudy", "Prue", "Queenie", "Quentin", "Querida", "Quinn", "Quinta", "Quintana", "Quintilla", "Quintina", "Rachael", "Rachel", "Rachele", "Rachelle", "Rae", "Raeann", "Raf", "Rafa", "Rafaela", "Rafaelia", "Rafaelita", "Rahal", "Rahel", "Raina", "Raine", "Rakel", "Ralina", "Ramona", "Ramonda", "Rana", "Randa", "Randee", "Randene", "Randi", "Randie", "Randy", "Ranee", "Rani", "Rania", "Ranice", "Ranique", "Ranna", "Raphaela", "Raquel", "Raquela", "Rasia", "Rasla", "Raven", "Ray", "Raychel", "Raye", "Rayna", "Raynell", "Rayshell", "Rea", "Reba", "Rebbecca", "Rebe", "Rebeca", "Rebecca", "Rebecka", "Rebeka", "Rebekah", "Rebekkah", "Ree", "Reeba", "Reena", "Reeta", "Reeva", "Regan", "Reggi", "Reggie", "Regina", "Regine", "Reiko", "Reina", "Reine", "Remy", "Rena", "Renae", "Renata", "Renate", "Rene", "Renee", "Renell", "Renelle", "Renie", "Rennie", "Reta", "Retha", "Revkah", "Rey", "Reyna", "Rhea", "Rheba", "Rheta", "Rhetta", "Rhiamon", "Rhianna", "Rhianon", "Rhoda", "Rhodia", "Rhodie", "Rhody", "Rhona", "Rhonda", "Riane", "Riannon", "Rianon", "Rica", "Ricca", "Rici", "Ricki", "Rickie", "Ricky", "Riki", "Rikki", "Rina", "Risa", "Rita", "Riva", "Rivalee", "Rivi", "Rivkah", "Rivy", "Roana", "Roanna", "Roanne", "Robbi", "Robbie", "Robbin", "Robby", "Robbyn", "Robena", "Robenia", "Roberta", "Robin", "Robina", "Robinet", "Robinett", "Robinetta", "Robinette", "Robinia", "Roby", "Robyn", "Roch", "Rochell", "Rochella", "Rochelle", "Rochette", "Roda", "Rodi", "Rodie", "Rodina", "Rois", "Romola", "Romona", "Romonda", "Romy", "Rona", "Ronalda", "Ronda", "Ronica", "Ronna", "Ronni", "Ronnica", "Ronnie", "Ronny", "Roobbie", "Rora", "Rori", "Rorie", "Rory", "Ros", "Rosa", "Rosabel", "Rosabella", "Rosabelle", "Rosaleen", "Rosalia", "Rosalie", "Rosalind", "Rosalinda", "Rosalinde", "Rosaline", "Rosalyn", "Rosalynd", "Rosamond", "Rosamund", "Rosana", "Rosanna", "Rosanne", "Rose", "Roseann", "Roseanna", "Roseanne", "Roselia", "Roselin", "Roseline", "Rosella", "Roselle", "Rosemaria", "Rosemarie", "Rosemary", "Rosemonde", "Rosene", "Rosetta", "Rosette", "Roshelle", "Rosie", "Rosina", "Rosita", "Roslyn", "Rosmunda", "Rosy", "Row", "Rowe", "Rowena", "Roxana", "Roxane", "Roxanna", "Roxanne", "Roxi", "Roxie", "Roxine", "Roxy", "Roz", "Rozalie", "Rozalin", "Rozamond", "Rozanna", "Rozanne", "Roze", "Rozele", "Rozella", "Rozelle", "Rozina", "Rubetta", "Rubi", "Rubia", "Rubie", "Rubina", "Ruby", "Ruperta", "Ruth", "Ruthann", "Ruthanne", "Ruthe", "Ruthi", "Ruthie", "Ruthy", "Ryann", "Rycca", "Saba", "Sabina", "Sabine", "Sabra", "Sabrina", "Sacha", "Sada", "Sadella", "Sadie", "Sadye", "Saidee", "Sal", "Salaidh", "Sallee", "Salli", "Sallie", "Sally", "Sallyann", "Sallyanne", "Saloma", "Salome", "Salomi", "Sam", "Samantha", "Samara", "Samaria", "Sammy", "Sande", "Sandi", "Sandie", "Sandra", "Sandy", "Sandye", "Sapphira", "Sapphire", "Sara", "Sara-ann", "Saraann", "Sarah", "Sarajane", "Saree", "Sarena", "Sarene", "Sarette", "Sari", "Sarina", "Sarine", "Sarita", "Sascha", "Sasha", "Sashenka", "Saudra", "Saundra", "Savina", "Sayre", "Scarlet", "Scarlett", "Sean", "Seana", "Seka", "Sela", "Selena", "Selene", "Selestina", "Selia", "Selie", "Selina", "Selinda", "Seline", "Sella", "Selle", "Selma", "Sena", "Sephira", "Serena", "Serene", "Shae", "Shaina", "Shaine", "Shalna", "Shalne", "Shana", "Shanda", "Shandee", "Shandeigh", "Shandie", "Shandra", "Shandy", "Shane", "Shani", "Shanie", "Shanna", "Shannah", "Shannen", "Shannon", "Shanon", "Shanta", "Shantee", "Shara", "Sharai", "Shari", "Sharia", "Sharity", "Sharl", "Sharla", "Sharleen", "Sharlene", "Sharline", "Sharon", "Sharona", "Sharron", "Sharyl", "Shaun", "Shauna", "Shawn", "Shawna", "Shawnee", "Shay", "Shayla", "Shaylah", "Shaylyn", "Shaylynn", "Shayna", "Shayne", "Shea", "Sheba", "Sheela", "Sheelagh", "Sheelah", "Sheena", "Sheeree", "Sheila", "Sheila-kathryn", "Sheilah", "Shel", "Shela", "Shelagh", "Shelba", "Shelbi", "Shelby", "Shelia", "Shell", "Shelley", "Shelli", "Shellie", "Shelly", "Shena", "Sher", "Sheree", "Sheri", "Sherie", "Sherill", "Sherilyn", "Sherline", "Sherri", "Sherrie", "Sherry", "Sherye", "Sheryl", "Shina", "Shir", "Shirl", "Shirlee", "Shirleen", "Shirlene", "Shirley", "Shirline", "Shoshana", "Shoshanna", "Siana", "Sianna", "Sib", "Sibbie", "Sibby", "Sibeal", "Sibel", "Sibella", "Sibelle", "Sibilla", "Sibley", "Sibyl", "Sibylla", "Sibylle", "Sidoney", "Sidonia", "Sidonnie", "Sigrid", "Sile", "Sileas", "Silva", "Silvana", "Silvia", "Silvie", "Simona", "Simone", "Simonette", "Simonne", "Sindee", "Siobhan", "Sioux", "Siouxie", "Sisely", "Sisile", "Sissie", "Sissy", "Siusan", "Sofia", "Sofie", "Sondra", "Sonia", "Sonja", "Sonni", "Sonnie", "Sonnnie", "Sonny", "Sonya", "Sophey", "Sophi", "Sophia", "Sophie", "Sophronia", "Sorcha", "Sosanna", "Stace", "Stacee", "Stacey", "Staci", "Stacia", "Stacie", "Stacy", "Stafani", "Star", "Starla", "Starlene", "Starlin", "Starr", "Stefa", "Stefania", "Stefanie", "Steffane", "Steffi", "Steffie", "Stella", "Stepha", "Stephana", "Stephani", "Stephanie", "Stephannie", "Stephenie", "Stephi", "Stephie", "Stephine", "Stesha", "Stevana", "Stevena", "Stoddard", "Storm", "Stormi", "Stormie", "Stormy", "Sue", "Suellen", "Sukey", "Suki", "Sula", "Sunny", "Sunshine", "Susan", "Susana", "Susanetta", "Susann", "Susanna", "Susannah", "Susanne", "Susette", "Susi", "Susie", "Susy", "Suzann", "Suzanna", "Suzanne", "Suzette", "Suzi", "Suzie", "Suzy", "Sybil", "Sybila", "Sybilla", "Sybille", "Sybyl", "Sydel", "Sydelle", "Sydney", "Sylvia", "Tabatha", "Tabbatha", "Tabbi", "Tabbie", "Tabbitha", "Tabby", "Tabina", "Tabitha", "Taffy", "Talia", "Tallia", "Tallie", "Tallou", "Tallulah", "Tally", "Talya", "Talyah", "Tamar", "Tamara", "Tamarah", "Tamarra", "Tamera", "Tami", "Tamiko", "Tamma", "Tammara", "Tammi", "Tammie", "Tammy", "Tamqrah", "Tamra", "Tana", "Tandi", "Tandie", "Tandy", "Tanhya", "Tani", "Tania", "Tanitansy", "Tansy", "Tanya", "Tara", "Tarah", "Tarra", "Tarrah", "Taryn", "Tasha", "Tasia", "Tate", "Tatiana", "Tatiania", "Tatum", "Tawnya", "Tawsha", "Ted", "Tedda", "Teddi", "Teddie", "Teddy", "Tedi", "Tedra", "Teena", "Teirtza", "Teodora", "Tera", "Teresa", "Terese", "Teresina", "Teresita", "Teressa", "Teri", "Teriann", "Terra", "Terri", "Terrie", "Terrijo", "Terry", "Terrye", "Tersina", "Terza", "Tess", "Tessa", "Tessi", "Tessie", "Tessy", "Thalia", "Thea", "Theadora", "Theda", "Thekla", "Thelma", "Theo", "Theodora", "Theodosia", "Theresa", "Therese", "Theresina", "Theresita", "Theressa", "Therine", "Thia", "Thomasa", "Thomasin", "Thomasina", "Thomasine", "Tiena", "Tierney", "Tiertza", "Tiff", "Tiffani", "Tiffanie", "Tiffany", "Tiffi", "Tiffie", "Tiffy", "Tilda", "Tildi", "Tildie", "Tildy", "Tillie", "Tilly", "Tim", "Timi", "Timmi", "Timmie", "Timmy", "Timothea", "Tina", "Tine", "Tiphani", "Tiphanie", "Tiphany", "Tish", "Tisha", "Tobe", "Tobey", "Tobi", "Toby", "Tobye", "Toinette", "Toma", "Tomasina", "Tomasine", "Tomi", "Tommi", "Tommie", "Tommy", "Toni", "Tonia", "Tonie", "Tony", "Tonya", "Tonye", "Tootsie", "Torey", "Tori", "Torie", "Torrie", "Tory", "Tova", "Tove", "Tracee", "Tracey", "Traci", "Tracie", "Tracy", "Trenna", "Tresa", "Trescha", "Tressa", "Tricia", "Trina", "Trish", "Trisha", "Trista", "Trix", "Trixi", "Trixie", "Trixy", "Truda", "Trude", "Trudey", "Trudi", "Trudie", "Trudy", "Trula", "Tuesday", "Twila", "Twyla", "Tybi", "Tybie", "Tyne", "Ula", "Ulla", "Ulrica", "Ulrika", "Ulrikaumeko", "Ulrike", "Umeko", "Una", "Ursa", "Ursala", "Ursola", "Ursula", "Ursulina", "Ursuline", "Uta", "Val", "Valaree", "Valaria", "Vale", "Valeda", "Valencia", "Valene", "Valenka", "Valentia", "Valentina", "Valentine", "Valera", "Valeria", "Valerie", "Valery", "Valerye", "Valida", "Valina", "Valli", "Vallie", "Vally", "Valma", "Valry", "Van", "Vanda", "Vanessa", "Vania", "Vanna", "Vanni", "Vannie", "Vanny", "Vanya", "Veda", "Velma", "Velvet", "Venita", "Venus", "Vera", "Veradis", "Vere", "Verena", "Verene", "Veriee", "Verile", "Verina", "Verine", "Verla", "Verna", "Vernice", "Veronica", "Veronika", "Veronike", "Veronique", "Vevay", "Vi", "Vicki", "Vickie", "Vicky", "Victoria", "Vida", "Viki", "Vikki", "Vikky", "Vilhelmina", "Vilma", "Vin", "Vina", "Vinita", "Vinni", "Vinnie", "Vinny", "Viola", "Violante", "Viole", "Violet", "Violetta", "Violette", "Virgie", "Virgina", "Virginia", "Virginie", "Vita", "Vitia", "Vitoria", "Vittoria", "Viv", "Viva", "Vivi", "Vivia", "Vivian", "Viviana", "Vivianna", "Vivianne", "Vivie", "Vivien", "Viviene", "Vivienne", "Viviyan", "Vivyan", "Vivyanne", "Vonni", "Vonnie", "Vonny", "Vyky", "Wallie", "Wallis", "Walliw", "Wally", "Waly", "Wanda", "Wandie", "Wandis", "Waneta", "Wanids", "Wenda", "Wendeline", "Wendi", "Wendie", "Wendy", "Wendye", "Wenona", "Wenonah", "Whitney", "Wileen", "Wilhelmina", "Wilhelmine", "Wilie", "Willa", "Willabella", "Willamina", "Willetta", "Willette", "Willi", "Willie", "Willow", "Willy", "Willyt", "Wilma", "Wilmette", "Wilona", "Wilone", "Wilow", "Windy", "Wini", "Winifred", "Winna", "Winnah", "Winne", "Winni", "Winnie", "Winnifred", "Winny", "Winona", "Winonah", "Wren", "Wrennie", "Wylma", "Wynn", "Wynne", "Wynnie", "Wynny", "Xaviera", "Xena", "Xenia", "Xylia", "Xylina", "Yalonda", "Yasmeen", "Yasmin", "Yelena", "Yetta", "Yettie", "Yetty", "Yevette", "Ynes", "Ynez", "Yoko", "Yolanda", "Yolande", "Yolane", "Yolanthe", "Yoshi", "Yoshiko", "Yovonnda", "Ysabel", "Yvette", "Yvonne", "Zabrina", "Zahara", "Zandra", "Zaneta", "Zara", "Zarah", "Zaria", "Zarla", "Zea", "Zelda", "Zelma", "Zena", "Zenia", "Zia", "Zilvia", "Zita", "Zitella", "Zoe", "Zola", "Zonda", "Zondra", "Zonnya", "Zora", "Zorah", "Zorana", "Zorina", "Zorine", "Zsazsa", "Zulema", "Zuzana"];

// src/providers/evaluators.ts
function formatEvaluatorNames(evaluators) {
  return evaluators.map((evaluator) => `'${evaluator.name}'`).join(",\n");
}
function formatEvaluatorExamples(evaluators) {
  return evaluators.map((evaluator) => {
    return evaluator.examples.map((example) => {
      const exampleNames = Array.from(
        { length: 5 },
        () => n({ dictionaries: [d] })
      );
      let formattedPrompt = example.prompt;
      let formattedOutcome = example.outcome;
      exampleNames.forEach((name, index) => {
        const placeholder = `{{name${index + 1}}}`;
        formattedPrompt = formattedPrompt.replaceAll(placeholder, name);
        formattedOutcome = formattedOutcome.replaceAll(placeholder, name);
      });
      const formattedMessages = example.messages.map((message) => {
        let messageString = `${message.name}: ${message.content.text}`;
        exampleNames.forEach((name, index) => {
          const placeholder = `{{name${index + 1}}}`;
          messageString = messageString.replaceAll(placeholder, name);
        });
        return messageString + (message.content.action || message.content.actions ? ` (${message.content.action || message.content.actions?.join(", ")})` : "");
      }).join("\n");
      return `Prompt:
${formattedPrompt}

Messages:
${formattedMessages}

Outcome:
${formattedOutcome}`;
    }).join("\n\n");
  }).join("\n\n");
}
function formatEvaluators(evaluators) {
  return evaluators.map((evaluator) => `'${evaluator.name}: ${evaluator.description}'`).join(",\n");
}
var evaluatorsProvider = {
  name: "EVALUATORS",
  description: "Evaluators that can be used to evaluate the conversation after responding",
  private: true,
  get: async (runtime, message, state) => {
    const evaluatorPromises = runtime.evaluators.map(async (evaluator) => {
      const result = await evaluator.validate(runtime, message, state);
      if (result) {
        return evaluator;
      }
      return null;
    });
    const resolvedEvaluators = await Promise.all(evaluatorPromises);
    const evaluatorsData = resolvedEvaluators.filter(Boolean);
    const evaluators = evaluatorsData.length > 0 ? addHeader6("# Available Evaluators", formatEvaluators(evaluatorsData)) : "";
    const evaluatorNames = evaluatorsData.length > 0 ? formatEvaluatorNames(evaluatorsData) : "";
    const evaluatorExamples = evaluatorsData.length > 0 ? addHeader6("# Evaluator Examples", formatEvaluatorExamples(evaluatorsData)) : "";
    const values = {
      evaluatorsData,
      evaluators,
      evaluatorNames,
      evaluatorExamples
    };
    const text = [evaluators, evaluatorExamples].filter(Boolean).join("\n\n");
    return {
      values,
      text
    };
  }
};

// src/providers/facts.ts
import { ModelType as ModelType12 } from "@elizaos/core";
import { logger as logger12 } from "@elizaos/core";
function formatFacts2(facts) {
  return facts.reverse().map((fact) => fact.content.text).join("\n");
}
var factsProvider = {
  name: "FACTS",
  description: "Key facts that the agent knows",
  dynamic: true,
  get: async (runtime, message, _state) => {
    try {
      const recentMessages = await runtime.getMemories({
        tableName: "messages",
        roomId: message.roomId,
        count: 10,
        unique: false
      });
      const last5Messages = recentMessages.slice(-5).map((message2) => message2.content.text).join("\n");
      const embedding = await runtime.useModel(ModelType12.TEXT_EMBEDDING, {
        text: last5Messages
      });
      const [relevantFacts, recentFactsData] = await Promise.all([
        runtime.searchMemories({
          tableName: "facts",
          embedding,
          roomId: message.roomId,
          worldId: message.worldId,
          count: 6,
          query: message.content.text
        }),
        runtime.searchMemories({
          embedding,
          query: message.content.text,
          tableName: "facts",
          roomId: message.roomId,
          entityId: message.entityId,
          count: 6
        })
      ]);
      const allFacts = [...relevantFacts, ...recentFactsData].filter(
        (fact, index, self) => index === self.findIndex((t) => t.id === fact.id)
      );
      if (allFacts.length === 0) {
        return {
          values: {
            facts: ""
          },
          data: {
            facts: allFacts
          },
          text: "No facts available."
        };
      }
      const formattedFacts = formatFacts2(allFacts);
      const text = "Key facts that {{agentName}} knows:\n{{formattedFacts}}".replace("{{agentName}}", runtime.character.name).replace("{{formattedFacts}}", formattedFacts);
      return {
        values: {
          facts: formattedFacts
        },
        data: {
          facts: allFacts
        },
        text
      };
    } catch (error) {
      logger12.error("Error in factsProvider:", error);
      return {
        values: {
          facts: ""
        },
        data: {
          facts: []
        },
        text: "Error retrieving facts."
      };
    }
  }
};

// src/providers/providers.ts
import { addHeader as addHeader7 } from "@elizaos/core";
var providersProvider = {
  name: "PROVIDERS",
  description: "List of all data providers the agent can use to get additional information",
  get: async (runtime, _message, _state) => {
    const dynamicProviders = runtime.providers.filter((provider) => provider.dynamic === true);
    const providerDescriptions = dynamicProviders.map((provider) => {
      return `- **${provider.name}**: ${provider.description || "No description available"}`;
    });
    const headerText = "# Providers\n\nThese providers are available for the agent to select and use:";
    if (providerDescriptions.length === 0) {
      return {
        text: addHeader7(headerText, "No dynamic providers are currently available.")
      };
    }
    const providersText = providerDescriptions.join("\n");
    const text = addHeader7(headerText, providersText);
    const data = {
      dynamicProviders: dynamicProviders.map((provider) => ({
        name: provider.name,
        description: provider.description || ""
      }))
    };
    return {
      text,
      data
    };
  }
};

// src/providers/recentMessages.ts
import {
  addHeader as addHeader8,
  ChannelType as ChannelType5,
  formatMessages,
  formatPosts,
  getEntityDetails as getEntityDetails3,
  logger as logger13
} from "@elizaos/core";
var getRecentInteractions = async (runtime, sourceEntityId, targetEntityId, excludeRoomId) => {
  const rooms = await runtime.getRoomsForParticipants([sourceEntityId, targetEntityId]);
  return runtime.getMemoriesByRoomIds({
    tableName: "messages",
    // filter out the current room id from rooms
    roomIds: rooms.filter((room) => room !== excludeRoomId),
    limit: 20
  });
};
var recentMessagesProvider = {
  name: "RECENT_MESSAGES",
  description: "Recent messages, interactions and other memories",
  position: 100,
  get: async (runtime, message) => {
    try {
      const { roomId } = message;
      const conversationLength = runtime.getConversationLength();
      const [entitiesData, room, recentMessagesData, recentInteractionsData] = await Promise.all([
        getEntityDetails3({ runtime, roomId }),
        runtime.getRoom(roomId),
        runtime.getMemories({
          tableName: "messages",
          roomId,
          count: conversationLength,
          unique: false
        }),
        message.entityId !== runtime.agentId ? getRecentInteractions(runtime, message.entityId, runtime.agentId, roomId) : Promise.resolve([])
      ]);
      const isPostFormat = room?.type ? room.type === ChannelType5.FEED || room.type === ChannelType5.THREAD : false;
      const [formattedRecentMessages, formattedRecentPosts] = await Promise.all([
        formatMessages({
          messages: recentMessagesData,
          entities: entitiesData
        }),
        formatPosts({
          messages: recentMessagesData,
          entities: entitiesData,
          conversationHeader: false
        })
      ]);
      const recentPosts = formattedRecentPosts && formattedRecentPosts.length > 0 ? addHeader8("# Posts in Thread", formattedRecentPosts) : "";
      const recentMessages = formattedRecentMessages && formattedRecentMessages.length > 0 ? addHeader8("# Conversation Messages", formattedRecentMessages) : "";
      if (!recentPosts && !recentMessages && recentMessagesData.length === 0 && !message.content.text) {
        return {
          data: {
            recentMessages: [],
            recentInteractions: []
          },
          values: {
            recentPosts: "",
            recentMessages: "",
            recentMessageInteractions: "",
            recentPostInteractions: "",
            recentInteractions: ""
          },
          text: "No recent messages available"
        };
      }
      const metaData = message.metadata;
      const senderName = entitiesData.find((entity) => entity.id === message.entityId)?.names[0] || metaData?.entityName || "Unknown User";
      const receivedMessageContent = message.content.text;
      const hasReceivedMessage = !!receivedMessageContent?.trim();
      const receivedMessageHeader = hasReceivedMessage ? addHeader8("# Received Message", `${senderName}: ${receivedMessageContent}`) : "";
      const focusHeader = hasReceivedMessage ? addHeader8(
        "# Focus your response",
        `You are replying to the above message from **${senderName}**. Keep your answer relevant to that message. Do not repeat earlier replies unless the sender asks again.`
      ) : "";
      const interactionEntityMap = /* @__PURE__ */ new Map();
      if (recentInteractionsData.length > 0) {
        const uniqueEntityIds = [
          ...new Set(
            recentInteractionsData.map((message2) => message2.entityId).filter((id) => id !== runtime.agentId)
          )
        ];
        const uniqueEntityIdSet = new Set(uniqueEntityIds);
        const entitiesDataIdSet = /* @__PURE__ */ new Set();
        entitiesData.forEach((entity) => {
          if (uniqueEntityIdSet.has(entity.id)) {
            interactionEntityMap.set(entity.id, entity);
            entitiesDataIdSet.add(entity.id);
          }
        });
        const remainingEntityIds = uniqueEntityIds.filter((id) => !entitiesDataIdSet.has(id));
        if (remainingEntityIds.length > 0) {
          const entities = await Promise.all(
            remainingEntityIds.map((entityId) => runtime.getEntityById(entityId))
          );
          entities.forEach((entity, index) => {
            if (entity) {
              interactionEntityMap.set(remainingEntityIds[index], entity);
            }
          });
        }
      }
      const getRecentMessageInteractions = async (recentInteractionsData2) => {
        const formattedInteractions = recentInteractionsData2.map((message2) => {
          const isSelf = message2.entityId === runtime.agentId;
          let sender;
          if (isSelf) {
            sender = runtime.character.name;
          } else {
            sender = interactionEntityMap.get(message2.entityId)?.metadata?.userName || "unknown";
          }
          return `${sender}: ${message2.content.text}`;
        });
        return formattedInteractions.join("\n");
      };
      const getRecentPostInteractions = async (recentInteractionsData2, entities) => {
        const combinedEntities = [...entities];
        const actorIds = new Set(entities.map((entity) => entity.id));
        for (const [id, entity] of interactionEntityMap.entries()) {
          if (!actorIds.has(id)) {
            combinedEntities.push(entity);
          }
        }
        const formattedInteractions = formatPosts({
          messages: recentInteractionsData2,
          entities: combinedEntities,
          conversationHeader: true
        });
        return formattedInteractions;
      };
      const [recentMessageInteractions, recentPostInteractions] = await Promise.all([
        getRecentMessageInteractions(recentInteractionsData),
        getRecentPostInteractions(recentInteractionsData, entitiesData)
      ]);
      const data = {
        recentMessages: recentMessagesData,
        recentInteractions: recentInteractionsData
      };
      const values = {
        recentPosts,
        recentMessages,
        recentMessageInteractions,
        recentPostInteractions,
        recentInteractions: isPostFormat ? recentPostInteractions : recentMessageInteractions
      };
      const text = [
        isPostFormat ? recentPosts : recentMessages,
        // Only add received message and focus headers if there are messages or a current message to process
        recentMessages || recentPosts || message.content.text ? receivedMessageHeader : "",
        recentMessages || recentPosts || message.content.text ? focusHeader : ""
      ].filter(Boolean).join("\n\n");
      return {
        data,
        values,
        text
      };
    } catch (error) {
      logger13.error("Error in recentMessagesProvider:", error);
      return {
        data: {
          recentMessages: [],
          recentInteractions: []
        },
        values: {
          recentPosts: "",
          recentMessages: "",
          recentMessageInteractions: "",
          recentPostInteractions: "",
          recentInteractions: ""
        },
        text: "Error retrieving recent messages."
        // Or 'No recent messages available' as the test expects
      };
    }
  }
};

// src/providers/relationships.ts
async function formatRelationships(runtime, relationships) {
  const sortedRelationships = relationships.filter((rel) => rel.metadata?.interactions).sort(
    (a2, b) => (b.metadata?.interactions || 0) - (a2.metadata?.interactions || 0)
  ).slice(0, 30);
  if (sortedRelationships.length === 0) {
    return "";
  }
  const uniqueEntityIds = Array.from(
    new Set(sortedRelationships.map((rel) => rel.targetEntityId))
  );
  const entities = await Promise.all(uniqueEntityIds.map((id) => runtime.getEntityById(id)));
  const entityMap = /* @__PURE__ */ new Map();
  entities.forEach((entity, index) => {
    if (entity) {
      entityMap.set(uniqueEntityIds[index], entity);
    }
  });
  const formatMetadata = (metadata) => {
    return JSON.stringify(
      Object.entries(metadata).map(
        ([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : value}`
      ).join("\n")
    );
  };
  const formattedRelationships = sortedRelationships.map((rel) => {
    const targetEntityId = rel.targetEntityId;
    const entity = entityMap.get(targetEntityId);
    if (!entity) {
      return null;
    }
    const names = entity.names.join(" aka ");
    return `${names}
${rel.tags ? rel.tags.join(", ") : ""}
${formatMetadata(entity.metadata)}
`;
  }).filter(Boolean);
  return formattedRelationships.join("\n");
}
var relationshipsProvider = {
  name: "RELATIONSHIPS",
  description: "Relationships between {{agentName}} and other people, or between other people that {{agentName}} has observed interacting with",
  dynamic: true,
  get: async (runtime, message) => {
    const relationships = await runtime.getRelationships({
      entityId: message.entityId
    });
    if (!relationships || relationships.length === 0) {
      return {
        data: {
          relationships: []
        },
        values: {
          relationships: "No relationships found."
        },
        text: "No relationships found."
      };
    }
    const formattedRelationships = await formatRelationships(runtime, relationships);
    if (!formattedRelationships) {
      return {
        data: {
          relationships: []
        },
        values: {
          relationships: "No relationships found."
        },
        text: "No relationships found."
      };
    }
    return {
      data: {
        relationships: formattedRelationships
      },
      values: {
        relationships: formattedRelationships
      },
      text: `# ${runtime.character.name} has observed ${message.content.senderName || message.content.name} interacting with these people:
${formattedRelationships}`
    };
  }
};

// src/providers/roles.ts
import {
  ChannelType as ChannelType6,
  createUniqueUuid as createUniqueUuid2,
  logger as logger14
} from "@elizaos/core";
var roleProvider = {
  name: "ROLES",
  description: "Roles in the server, default are OWNER, ADMIN and MEMBER (as well as NONE)",
  get: async (runtime, message, state) => {
    const room = state.data.room ?? await runtime.getRoom(message.roomId);
    if (!room) {
      throw new Error("No room found");
    }
    if (room.type !== ChannelType6.GROUP) {
      return {
        data: {
          roles: []
        },
        values: {
          roles: "No access to role information in DMs, the role provider is only available in group scenarios."
        },
        text: "No access to role information in DMs, the role provider is only available in group scenarios."
      };
    }
    const serverId = room.serverId;
    if (!serverId) {
      throw new Error("No server ID found");
    }
    logger14.info(`Using server ID: ${serverId}`);
    const worldId = createUniqueUuid2(runtime, serverId);
    const world = await runtime.getWorld(worldId);
    if (!world || !world.metadata?.ownership?.ownerId) {
      logger14.info(
        `No ownership data found for server ${serverId}, initializing empty role hierarchy`
      );
      return {
        data: {
          roles: []
        },
        values: {
          roles: "No role information available for this server."
        },
        text: "No role information available for this server."
      };
    }
    const roles = world.metadata.roles || {};
    if (Object.keys(roles).length === 0) {
      logger14.info(`No roles found for server ${serverId}`);
      return {
        data: {
          roles: []
        },
        values: {
          roles: "No role information available for this server."
        },
        text: "No role information available for this server."
      };
    }
    logger14.info(`Found ${Object.keys(roles).length} roles`);
    const owners = [];
    const admins = [];
    const members = [];
    for (const entityId of Object.keys(roles)) {
      const userRole = roles[entityId];
      const user = await runtime.getEntityById(entityId);
      const name = user?.metadata?.name;
      const username = user?.metadata?.username;
      const names = user?.names;
      if (owners.some((owner) => owner.username === username) || admins.some((admin) => admin.username === username) || members.some((member) => member.username === username)) {
        continue;
      }
      if (!name || !username || !names) {
        logger14.warn(`User ${entityId} has no name or username, skipping`);
        continue;
      }
      switch (userRole) {
        case "OWNER":
          owners.push({ name, username, names });
          break;
        case "ADMIN":
          admins.push({ name, username, names });
          break;
        default:
          members.push({ name, username, names });
          break;
      }
    }
    let response = "# Server Role Hierarchy\n\n";
    if (owners.length > 0) {
      response += "## Owners\n";
      owners.forEach((owner) => {
        response += `${owner.name} (${owner.names.join(", ")})
`;
      });
      response += "\n";
    }
    if (admins.length > 0) {
      response += "## Administrators\n";
      admins.forEach((admin) => {
        response += `${admin.name} (${admin.names.join(", ")}) (${admin.username})
`;
      });
      response += "\n";
    }
    if (members.length > 0) {
      response += "## Members\n";
      members.forEach((member) => {
        response += `${member.name} (${member.names.join(", ")}) (${member.username})
`;
      });
    }
    if (owners.length === 0 && admins.length === 0 && members.length === 0) {
      return {
        data: {
          roles: []
        },
        values: {
          roles: "No role information available for this server."
        },
        text: "No role information available for this server."
      };
    }
    return {
      data: {
        roles: response
      },
      values: {
        roles: response
      },
      text: response
    };
  }
};

// src/providers/settings.ts
import {
  ChannelType as ChannelType7,
  findWorldsForOwner as findWorldsForOwner2,
  getWorldSettings as getWorldSettings2,
  logger as logger15
} from "@elizaos/core";
var formatSettingValue = (setting, isOnboarding) => {
  if (setting.value === null) return "Not set";
  if (setting.secret && !isOnboarding) return "****************";
  return String(setting.value);
};
function generateStatusMessage(runtime, worldSettings, isOnboarding, state) {
  try {
    const formattedSettings = Object.entries(worldSettings).map(([key, setting]) => {
      if (typeof setting !== "object" || !setting.name) return null;
      const description = setting.description || "";
      const usageDescription = setting.usageDescription || "";
      if (setting.visibleIf && !setting.visibleIf(worldSettings)) {
        return null;
      }
      return {
        key,
        name: setting.name,
        value: formatSettingValue(setting, isOnboarding),
        description,
        usageDescription,
        required: setting.required,
        configured: setting.value !== null
      };
    }).filter(Boolean);
    const requiredUnconfigured = formattedSettings.filter(
      (s) => s?.required && !s.configured
    ).length;
    if (isOnboarding) {
      const settingsList = formattedSettings.map((s) => {
        const label = s?.required ? "(Required)" : "(Optional)";
        return `${s?.key}: ${s?.value} ${label}
(${s?.name}) ${s?.usageDescription}`;
      }).join("\n\n");
      const validKeys = `Valid setting keys: ${Object.keys(worldSettings).join(", ")}`;
      const commonInstructions = `Instructions for ${runtime.character.name}:
      - Only update settings if the user is clearly responding to a setting you are currently asking about.
      - If the user's reply clearly maps to a setting and a valid value, you **must** call the UPDATE_SETTINGS action with the correct key and value. Do not just respond with a message saying it's updated \u2014 it must be an action.
      - Never hallucinate settings or respond with values not listed above.
      - Do not call UPDATE_SETTINGS just because the user has started onboarding or you think a setting needs to be configured. Only update when the user clearly provides a specific value for a setting you are currently asking about.
      - Answer setting-related questions using only the name, description, and value from the list.`;
      if (requiredUnconfigured > 0) {
        return `# PRIORITY TASK: Onboarding with ${state?.senderName}

        ${runtime.character.name} needs to help the user configure ${requiredUnconfigured} required settings:
        
        ${settingsList}
        
        ${validKeys}
        
        ${commonInstructions}
        
        - Prioritize configuring required settings before optional ones.`;
      }
      return `All required settings have been configured. Here's the current configuration:
      
        ${settingsList}
        
        ${validKeys}
        
        ${commonInstructions}`;
    }
    return `## Current Configuration

${requiredUnconfigured > 0 ? `IMPORTANT!: ${requiredUnconfigured} required settings still need configuration. ${runtime.character.name} should get onboarded with the OWNER as soon as possible.

` : "All required settings are configured.\n\n"}${formattedSettings.map((s) => `### ${s?.name}
**Value:** ${s?.value}
**Description:** ${s?.description}`).join("\n\n")}`;
  } catch (error) {
    logger15.error(`Error generating status message: ${error}`);
    return "Error generating configuration status.";
  }
}
var settingsProvider = {
  name: "SETTINGS",
  description: "Current settings for the server",
  get: async (runtime, message, state) => {
    try {
      const [room, userWorlds] = await Promise.all([
        runtime.getRoom(message.roomId),
        findWorldsForOwner2(runtime, message.entityId)
      ]).catch((error) => {
        logger15.error(`Error fetching initial data: ${error}`);
        throw new Error("Failed to retrieve room or user world information");
      });
      if (!room) {
        logger15.error("No room found for settings provider");
        return {
          data: {
            settings: []
          },
          values: {
            settings: "Error: Room not found"
          },
          text: "Error: Room not found"
        };
      }
      if (!room.worldId) {
        logger15.debug("No world found for settings provider -- settings provider will be skipped");
        return {
          data: {
            settings: []
          },
          values: {
            settings: "Room does not have a worldId -- settings provider will be skipped"
          },
          text: "Room does not have a worldId -- settings provider will be skipped"
        };
      }
      const type = room.type;
      const isOnboarding = type === ChannelType7.DM;
      let world = null;
      let serverId = void 0;
      let worldSettings = null;
      if (isOnboarding) {
        world = userWorlds?.find((world2) => world2.metadata?.settings !== void 0);
        if (!world && userWorlds && userWorlds.length > 0) {
          world = userWorlds[0];
          if (!world.metadata) {
            world.metadata = {};
          }
          world.metadata.settings = {};
          await runtime.updateWorld(world);
          logger15.info(`Initialized settings for user's world ${world.id}`);
        }
        if (!world) {
          logger15.error("No world found for user during onboarding");
          throw new Error("No server ownership found for onboarding");
        }
        serverId = world.serverId;
        try {
          worldSettings = await getWorldSettings2(runtime, serverId);
        } catch (error) {
          logger15.error(`Error fetching world settings: ${error}`);
          throw new Error(`Failed to retrieve settings for server ${serverId}`);
        }
      } else {
        try {
          world = await runtime.getWorld(room.worldId);
          if (!world) {
            logger15.error(`No world found for room ${room.worldId}`);
            throw new Error(`No world found for room ${room.worldId}`);
          }
          serverId = world.serverId;
          if (serverId) {
            worldSettings = await getWorldSettings2(runtime, serverId);
          } else {
            logger15.error(`No server ID found for world ${room.worldId}`);
          }
        } catch (error) {
          logger15.error(`Error processing world data: ${error}`);
          throw new Error("Failed to process world information");
        }
      }
      if (!serverId) {
        logger15.info(
          `No server ownership found for user ${message.entityId} after recovery attempt`
        );
        return isOnboarding ? {
          data: {
            settings: []
          },
          values: {
            settings: "The user doesn't appear to have ownership of any servers. They should make sure they're using the correct account."
          },
          text: "The user doesn't appear to have ownership of any servers. They should make sure they're using the correct account."
        } : {
          data: {
            settings: []
          },
          values: {
            settings: "Error: No configuration access"
          },
          text: "Error: No configuration access"
        };
      }
      if (!worldSettings) {
        logger15.info(`No settings state found for server ${serverId}`);
        return isOnboarding ? {
          data: {
            settings: []
          },
          values: {
            settings: "The user doesn't appear to have any settings configured for this server. They should configure some settings for this server."
          },
          text: "The user doesn't appear to have any settings configured for this server. They should configure some settings for this server."
        } : {
          data: {
            settings: []
          },
          values: {
            settings: "Configuration has not been completed yet."
          },
          text: "Configuration has not been completed yet."
        };
      }
      const output = generateStatusMessage(runtime, worldSettings, isOnboarding, state);
      return {
        data: {
          settings: worldSettings
        },
        values: {
          settings: output
        },
        text: output
      };
    } catch (error) {
      logger15.error(`Critical error in settings provider: ${error}`);
      return {
        data: {
          settings: []
        },
        values: {
          settings: "Error retrieving configuration information. Please try again later."
        },
        text: "Error retrieving configuration information. Please try again later."
      };
    }
  }
};

// src/providers/time.ts
var timeProvider = {
  name: "TIME",
  get: async (_runtime, _message) => {
    const currentDate = /* @__PURE__ */ new Date();
    const options = {
      timeZone: "UTC",
      dateStyle: "full",
      timeStyle: "long"
    };
    const humanReadable = new Intl.DateTimeFormat("en-US", options).format(currentDate);
    return {
      data: {
        time: currentDate
      },
      values: {
        time: humanReadable
      },
      text: `The current date and time is ${humanReadable}. Please use this as your reference for any time-based operations or responses.`
    };
  }
};

// src/providers/world.ts
import {
  logger as logger16,
  addHeader as addHeader9,
  ChannelType as ChannelType8
} from "@elizaos/core";
var worldProvider = {
  name: "WORLD",
  description: "World and environment information",
  dynamic: true,
  get: async (runtime, message) => {
    try {
      logger16.debug("[\u{1F310}] World provider activated for roomId:", message.roomId);
      const currentRoom = await runtime.getRoom(message.roomId);
      if (!currentRoom) {
        logger16.warn(`World provider: Room not found for roomId ${message.roomId}`);
        return {
          data: {
            world: {
              info: "Unable to retrieve world information - room not found"
            }
          },
          text: "Unable to retrieve world information - room not found"
        };
      }
      logger16.debug(`[\u{1F310}] World provider: Found room "${currentRoom.name}" (${currentRoom.type})`);
      const worldId = currentRoom.worldId;
      if (!worldId) {
        logger16.warn(`World provider: World ID not found for roomId ${message.roomId}`);
        return {
          data: {
            world: {
              info: "Unable to retrieve world information - world ID not found"
            }
          },
          text: "Unable to retrieve world information - world ID not found"
        };
      }
      const world = await runtime.getWorld(worldId);
      if (!world) {
        logger16.warn(`World provider: World not found for worldId ${worldId}`);
        return {
          data: {
            world: {
              info: "Unable to retrieve world information - world not found"
            }
          },
          text: "Unable to retrieve world information - world not found"
        };
      }
      logger16.debug(`[\u{1F310}] World provider: Found world "${world.name}" (ID: ${world.id})`);
      const worldRooms = await runtime.getRooms(worldId);
      logger16.debug(
        `[\u{1F310}] World provider: Found ${worldRooms.length} rooms in world "${world.name}"`
      );
      const participants = await runtime.getParticipantsForRoom(message.roomId);
      logger16.debug(
        `[\u{1F310}] World provider: Found ${participants.length} participants in room "${currentRoom.name}"`
      );
      const channelsByType = {
        text: [],
        voice: [],
        dm: [],
        feed: [],
        thread: [],
        other: []
      };
      for (const room of worldRooms) {
        if (!room?.id || !room.name) {
          logger16.warn(`World provider: Room ID or name is missing for room ${room.id}`);
          continue;
        }
        const roomInfo = {
          id: room.id,
          name: room.name,
          isCurrentChannel: room.id === message.roomId
        };
        if (room.type === ChannelType8.GROUP || room.type === ChannelType8.WORLD || room.type === ChannelType8.FORUM) {
          channelsByType.text.push(roomInfo);
        } else if (room.type === ChannelType8.VOICE_GROUP || room.type === ChannelType8.VOICE_DM) {
          channelsByType.voice.push(roomInfo);
        } else if (room.type === ChannelType8.DM || room.type === ChannelType8.SELF) {
          channelsByType.dm.push(roomInfo);
        } else if (room.type === ChannelType8.FEED) {
          channelsByType.feed.push(roomInfo);
        } else if (room.type === ChannelType8.THREAD) {
          channelsByType.thread.push(roomInfo);
        } else {
          channelsByType.other.push({
            ...roomInfo,
            type: room.type
          });
        }
      }
      const worldInfoText = [
        `# World: ${world.name}`,
        `Current Channel: ${currentRoom.name} (${currentRoom.type})`,
        `Total Channels: ${worldRooms.length}`,
        `Participants in current channel: ${participants.length}`,
        "",
        `Text channels: ${channelsByType.text.length}`,
        `Voice channels: ${channelsByType.voice.length}`,
        `DM channels: ${channelsByType.dm.length}`,
        `Feed channels: ${channelsByType.feed.length}`,
        `Thread channels: ${channelsByType.thread.length}`,
        `Other channels: ${channelsByType.other.length}`
      ].join("\n");
      const data = {
        world: {
          id: world.id,
          name: world.name,
          serverId: world.serverId,
          metadata: world.metadata || {},
          currentRoom: {
            id: currentRoom.id,
            name: currentRoom.name,
            type: currentRoom.type,
            channelId: currentRoom.channelId,
            participantCount: participants.length
          },
          channels: channelsByType,
          channelStats: {
            total: worldRooms.length,
            text: channelsByType.text.length,
            voice: channelsByType.voice.length,
            dm: channelsByType.dm.length,
            feed: channelsByType.feed.length,
            thread: channelsByType.thread.length,
            other: channelsByType.other.length
          }
        }
      };
      const values = {
        worldName: world.name,
        currentChannelName: currentRoom.name,
        worldInfo: worldInfoText
      };
      const formattedText = addHeader9("# World Information", worldInfoText);
      logger16.debug("[\u{1F310}] World provider completed successfully");
      return {
        data,
        values,
        text: formattedText
      };
    } catch (error) {
      logger16.error(
        `Error in world provider: ${error instanceof Error ? error.message : String(error)}`
      );
      return {
        data: {
          world: {
            info: "Error retrieving world information",
            error: error instanceof Error ? error.message : "Unknown error"
          }
        },
        text: "Error retrieving world information"
      };
    }
  }
};

// src/services/task.ts
import {
  logger as logger17,
  Service,
  ServiceType
} from "@elizaos/core";
var TaskService = class _TaskService extends Service {
  timer = null;
  TICK_INTERVAL = 1e3;
  // Check every second
  static serviceType = ServiceType.TASK;
  capabilityDescription = "The agent is able to schedule and execute tasks";
  /**
   * Start the TaskService with the given runtime.
   * @param {IAgentRuntime} runtime - The runtime for the TaskService.
   * @returns {Promise<Service>} A promise that resolves with the TaskService instance.
   */
  static async start(runtime) {
    const service = new _TaskService(runtime);
    await service.startTimer();
    return service;
  }
  /**
   * Asynchronously creates test tasks by registering task workers for repeating and one-time tasks,
   * validates the tasks, executes the tasks, and creates the tasks if they do not already exist.
   */
  async createTestTasks() {
    this.runtime.registerTaskWorker({
      name: "REPEATING_TEST_TASK",
      validate: async (_runtime, _message, _state) => {
        logger17.debug("[Bootstrap] Validating repeating test task");
        return true;
      },
      execute: async (_runtime, _options) => {
        logger17.debug("[Bootstrap] Executing repeating test task");
      }
    });
    this.runtime.registerTaskWorker({
      name: "ONETIME_TEST_TASK",
      validate: async (_runtime, _message, _state) => {
        logger17.debug("[Bootstrap] Validating one-time test task");
        return true;
      },
      execute: async (_runtime, _options) => {
        logger17.debug("[Bootstrap] Executing one-time test task");
      }
    });
    const tasks = await this.runtime.getTasksByName("REPEATING_TEST_TASK");
    if (tasks.length === 0) {
      await this.runtime.createTask({
        name: "REPEATING_TEST_TASK",
        description: "A test task that repeats every minute",
        metadata: {
          updatedAt: Date.now(),
          // Use timestamp instead of Date object
          updateInterval: 1e3 * 60
          // 1 minute
        },
        tags: ["queue", "repeat", "test"]
      });
    }
    await this.runtime.createTask({
      name: "ONETIME_TEST_TASK",
      description: "A test task that runs once",
      metadata: {
        updatedAt: Date.now()
      },
      tags: ["queue", "test"]
    });
  }
  /**
   * Starts a timer that runs a function to check tasks at a specified interval.
   */
  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(async () => {
      try {
        await this.checkTasks();
      } catch (error) {
        logger17.error("[Bootstrap] Error checking tasks:", error);
      }
    }, this.TICK_INTERVAL);
  }
  /**
   * Validates an array of Task objects.
   * Skips tasks without IDs or if no worker is found for the task.
   * If a worker has a `validate` function, it will run the validation using the `runtime`, `Memory`, and `State` parameters.
   * If the validation fails, the task will be skipped and the error will be logged.
   * @param {Task[]} tasks - An array of Task objects to validate.
   * @returns {Promise<Task[]>} - A Promise that resolves with an array of validated Task objects.
   */
  async validateTasks(tasks) {
    const validatedTasks = [];
    for (const task of tasks) {
      if (!task.id) {
        continue;
      }
      const worker = this.runtime.getTaskWorker(task.name);
      if (!worker) {
        continue;
      }
      if (worker.validate) {
        try {
          const isValid = await worker.validate(this.runtime, {}, {});
          if (!isValid) {
            continue;
          }
        } catch (error) {
          logger17.error(`[Bootstrap] Error validating task ${task.name}:`, error);
          continue;
        }
      }
      validatedTasks.push(task);
    }
    return validatedTasks;
  }
  /**
   * Asynchronous method that checks tasks with "queue" tag, validates and sorts them, then executes them based on interval and tags.
   *
   * @returns {Promise<void>} Promise that resolves once all tasks are checked and executed
   */
  async checkTasks() {
    try {
      const allTasks = await this.runtime.getTasks({
        tags: ["queue"]
      });
      const tasks = await this.validateTasks(allTasks);
      const now = Date.now();
      for (const task of tasks) {
        let taskStartTime;
        if (!task.tags?.includes("repeat")) {
          await this.executeTask(task);
          continue;
        }
        if (typeof task.updatedAt === "number") {
          taskStartTime = task.updatedAt;
        } else if (task.metadata?.updatedAt && typeof task.metadata.updatedAt === "number") {
          taskStartTime = task.metadata.updatedAt;
        } else if (task.updatedAt) {
          taskStartTime = new Date(task.updatedAt).getTime();
        } else {
          taskStartTime = 0;
        }
        const updateIntervalMs = task.metadata?.updateInterval ?? 0;
        if (!task.tags?.includes("repeat")) {
          await this.executeTask(task);
          continue;
        }
        if (task.metadata?.updatedAt === task.metadata?.createdAt) {
          if (task.tags?.includes("immediate")) {
            logger17.debug("[Bootstrap] Immediately running task", task.name);
            await this.executeTask(task);
            continue;
          }
        }
        if (now - taskStartTime >= updateIntervalMs) {
          logger17.debug(
            `[Bootstrap] Executing task ${task.name} - interval of ${updateIntervalMs}ms has elapsed`
          );
          await this.executeTask(task);
        }
      }
    } catch (error) {
      logger17.error("[Bootstrap] Error checking tasks:", error);
    }
  }
  /**
   * Executes a given task asynchronously.
   *
   * @param {Task} task - The task to be executed.
   */
  async executeTask(task) {
    try {
      if (!task || !task.id) {
        logger17.debug(`[Bootstrap] Task not found`);
        return;
      }
      const worker = this.runtime.getTaskWorker(task.name);
      if (!worker) {
        logger17.debug(`[Bootstrap] No worker found for task type: ${task.name}`);
        return;
      }
      if (task.tags?.includes("repeat")) {
        await this.runtime.updateTask(task.id, {
          metadata: {
            ...task.metadata,
            updatedAt: Date.now()
          }
        });
        logger17.debug(
          `[Bootstrap] Updated repeating task ${task.name} (${task.id}) with new timestamp`
        );
      }
      logger17.debug(`[Bootstrap] Executing task ${task.name} (${task.id})`);
      await worker.execute(this.runtime, task.metadata || {}, task);
      if (!task.tags?.includes("repeat")) {
        await this.runtime.deleteTask(task.id);
        logger17.debug(
          `[Bootstrap] Deleted non-repeating task ${task.name} (${task.id}) after execution`
        );
      }
    } catch (error) {
      logger17.error(`[Bootstrap] Error executing task ${task.id}:`, error);
    }
  }
  /**
   * Stops the TASK service in the given agent runtime.
   *
   * @param {IAgentRuntime} runtime - The agent runtime containing the service.
   * @returns {Promise<void>} - A promise that resolves once the service has been stopped.
   */
  static async stop(runtime) {
    const service = runtime.getService(ServiceType.TASK);
    if (service) {
      await service.stop();
    }
  }
  /**
   * Stops the timer if it is currently running.
   */
  async stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
};

// src/index.ts
var latestResponseIds = /* @__PURE__ */ new Map();
async function fetchMediaData(attachments) {
  return Promise.all(
    attachments.map(async (attachment) => {
      if (/^(http|https):\/\//.test(attachment.url)) {
        const response = await fetch(attachment.url);
        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${attachment.url}`);
        }
        const mediaBuffer = Buffer.from(await response.arrayBuffer());
        const mediaType = attachment.contentType || "image/png";
        return { data: mediaBuffer, mediaType };
      }
      throw new Error(`File not found: ${attachment.url}. Make sure the path is correct.`);
    })
  );
}
async function processAttachments(attachments, runtime) {
  if (!attachments || attachments.length === 0) {
    return [];
  }
  logger18.debug(`[Bootstrap] Processing ${attachments.length} attachment(s)`);
  const processedAttachments = [];
  for (const attachment of attachments) {
    try {
      const processedAttachment = { ...attachment };
      if (attachment.contentType === ContentType.IMAGE && !attachment.description) {
        logger18.debug(`[Bootstrap] Generating description for image: ${attachment.url}`);
        try {
          const response = await runtime.useModel(ModelType13.IMAGE_DESCRIPTION, {
            prompt: imageDescriptionTemplate,
            imageUrl: attachment.url
          });
          if (typeof response === "string") {
            const parsedXml = parseKeyValueXml(response);
            if (parsedXml?.description && parsedXml?.text) {
              processedAttachment.description = parsedXml.description;
              processedAttachment.title = parsedXml.title || "Image";
              processedAttachment.text = parsedXml.text;
              logger18.debug(
                `[Bootstrap] Generated description: ${processedAttachment.description?.substring(0, 100)}...`
              );
            } else {
              logger18.warn(`[Bootstrap] Failed to parse XML response for image description`);
            }
          } else if (response && typeof response === "object" && "description" in response) {
            processedAttachment.description = response.description;
            processedAttachment.title = response.title || "Image";
            processedAttachment.text = response.description;
            logger18.debug(
              `[Bootstrap] Generated description: ${processedAttachment.description?.substring(0, 100)}...`
            );
          } else {
            logger18.warn(`[Bootstrap] Unexpected response format for image description`);
          }
        } catch (error) {
          logger18.error(`[Bootstrap] Error generating image description:`, error);
        }
      }
      processedAttachments.push(processedAttachment);
    } catch (error) {
      logger18.error(`[Bootstrap] Failed to process attachment ${attachment.url}:`, error);
      processedAttachments.push(attachment);
    }
  }
  return processedAttachments;
}
function shouldBypassShouldRespond(runtime, room, source) {
  if (!room) return false;
  function normalizeEnvList(value) {
    if (!value || typeof value !== "string") return [];
    const cleaned = value.trim().replace(/^\[|\]$/g, "");
    return cleaned.split(",").map((v) => v.trim()).filter(Boolean);
  }
  const defaultBypassTypes = [
    ChannelType9.DM,
    ChannelType9.VOICE_DM,
    ChannelType9.SELF,
    ChannelType9.API
  ];
  const defaultBypassSources = ["client_chat"];
  const bypassTypesSetting = normalizeEnvList(runtime.getSetting("SHOULD_RESPOND_BYPASS_TYPES"));
  const bypassSourcesSetting = normalizeEnvList(
    runtime.getSetting("SHOULD_RESPOND_BYPASS_SOURCES")
  );
  const bypassTypes = new Set(
    [...defaultBypassTypes.map((t) => t.toString()), ...bypassTypesSetting].map(
      (s) => s.trim().toLowerCase()
    )
  );
  const bypassSources = [...defaultBypassSources, ...bypassSourcesSetting].map(
    (s) => s.trim().toLowerCase()
  );
  const roomType = room.type?.toString().toLowerCase();
  const sourceStr = source?.toLowerCase() || "";
  return bypassTypes.has(roomType) || bypassSources.some((pattern) => sourceStr.includes(pattern));
}
var messageReceivedHandler = async ({
  runtime,
  message,
  callback,
  onComplete
}) => {
  const timeoutDuration = 60 * 60 * 1e3;
  let timeoutId = void 0;
  try {
    logger18.info(`[Bootstrap] Message received from ${message.entityId} in room ${message.roomId}`);
    const responseId = v4_default();
    if (!latestResponseIds.has(runtime.agentId)) {
      latestResponseIds.set(runtime.agentId, /* @__PURE__ */ new Map());
    }
    const agentResponses = latestResponseIds.get(runtime.agentId);
    if (!agentResponses) {
      throw new Error("Agent responses map not found");
    }
    agentResponses.set(message.roomId, responseId);
    const runId = runtime.startRun();
    const startTime = Date.now();
    await runtime.emitEvent(EventType.RUN_STARTED, {
      runtime,
      runId,
      messageId: message.id,
      roomId: message.roomId,
      entityId: message.entityId,
      startTime,
      status: "started",
      source: "messageHandler"
    });
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(async () => {
        await runtime.emitEvent(EventType.RUN_TIMEOUT, {
          runtime,
          runId,
          messageId: message.id,
          roomId: message.roomId,
          entityId: message.entityId,
          startTime,
          status: "timeout",
          endTime: Date.now(),
          duration: Date.now() - startTime,
          error: "Run exceeded 60 minute timeout",
          source: "messageHandler"
        });
        reject(new Error("Run exceeded 60 minute timeout"));
      }, timeoutDuration);
    });
    const processingPromise = (async () => {
      try {
        if (message.entityId === runtime.agentId) {
          logger18.debug(`[Bootstrap] Skipping message from self (${runtime.agentId})`);
          throw new Error("Message is from the agent itself");
        }
        logger18.debug(
          `[Bootstrap] Processing message: ${truncateToCompleteSentence(message.content.text || "", 50)}...`
        );
        logger18.debug("[Bootstrap] Saving message to memory and embeddings");
        await Promise.all([
          runtime.addEmbeddingToMemory(message),
          runtime.createMemory(message, "messages")
        ]);
        const agentUserState = await runtime.getParticipantUserState(
          message.roomId,
          runtime.agentId
        );
        if (agentUserState === "MUTED" && !message.content.text?.toLowerCase().includes(runtime.character.name.toLowerCase())) {
          logger18.debug(`[Bootstrap] Ignoring muted room ${message.roomId}`);
          return;
        }
        let state = await runtime.composeState(
          message,
          ["ANXIETY", "SHOULD_RESPOND", "ENTITIES", "CHARACTER", "RECENT_MESSAGES", "ACTIONS"],
          true
        );
        const room = await runtime.getRoom(message.roomId);
        const shouldSkipShouldRespond = shouldBypassShouldRespond(
          runtime,
          room ?? void 0,
          message.content.source
        );
        if (message.content.attachments && message.content.attachments.length > 0) {
          message.content.attachments = await processAttachments(
            message.content.attachments,
            runtime
          );
        }
        let shouldRespond = true;
        if (!shouldSkipShouldRespond) {
          const shouldRespondPrompt = composePromptFromState9({
            state,
            template: runtime.character.templates?.shouldRespondTemplate || shouldRespondTemplate
          });
          logger18.debug(
            `[Bootstrap] Evaluating response for ${runtime.character.name}
Prompt: ${shouldRespondPrompt}`
          );
          const response = await runtime.useModel(ModelType13.TEXT_SMALL, {
            prompt: shouldRespondPrompt
          });
          logger18.debug(
            `[Bootstrap] Response evaluation for ${runtime.character.name}:
${response}`
          );
          logger18.debug(`[Bootstrap] Response type: ${typeof response}`);
          const responseObject = parseKeyValueXml(response);
          logger18.debug("[Bootstrap] Parsed response:", responseObject);
          const nonResponseActions = ["IGNORE", "NONE"];
          shouldRespond = responseObject?.action && !nonResponseActions.includes(responseObject.action.toUpperCase());
        } else {
          logger18.debug(
            `[Bootstrap] Skipping shouldRespond check for ${runtime.character.name} because ${room?.type} ${room?.source}`
          );
          shouldRespond = true;
        }
        let responseMessages = [];
        console.log("shouldRespond is", shouldRespond);
        console.log("shouldSkipShouldRespond", shouldSkipShouldRespond);
        if (shouldRespond) {
          state = await runtime.composeState(message, ["ACTIONS"]);
          if (!state.values.actionNames) {
            logger18.warn("actionNames data missing from state, even though it was requested");
          }
          const prompt = composePromptFromState9({
            state,
            template: runtime.character.templates?.messageHandlerTemplate || messageHandlerTemplate
          });
          let responseContent = null;
          let retries = 0;
          const maxRetries = 3;
          while (retries < maxRetries && (!responseContent?.thought || !responseContent?.actions)) {
            let response = await runtime.useModel(ModelType13.TEXT_LARGE, {
              prompt
            });
            logger18.debug("[Bootstrap] *** Raw LLM Response ***\n", response);
            const parsedXml = parseKeyValueXml(response);
            logger18.debug("[Bootstrap] *** Parsed XML Content ***\n", parsedXml);
            if (parsedXml) {
              responseContent = {
                ...parsedXml,
                thought: parsedXml.thought || "",
                actions: parsedXml.actions || ["IGNORE"],
                providers: parsedXml.providers || [],
                text: parsedXml.text || "",
                simple: parsedXml.simple || false
              };
            } else {
              responseContent = null;
            }
            retries++;
            if (!responseContent?.thought || !responseContent?.actions) {
              logger18.warn(
                "[Bootstrap] *** Missing required fields (thought or actions), retrying... ***\n",
                response,
                parsedXml,
                responseContent
              );
            }
          }
          const currentResponseId = agentResponses.get(message.roomId);
          if (currentResponseId !== responseId) {
            logger18.info(
              `Response discarded - newer message being processed for agent: ${runtime.agentId}, room: ${message.roomId}`
            );
            return;
          }
          if (responseContent && message.id) {
            responseContent.inReplyTo = createUniqueUuid3(runtime, message.id);
            const isSimple = responseContent.actions?.length === 1 && responseContent.actions[0].toUpperCase() === "REPLY" && (!responseContent.providers || responseContent.providers.length === 0);
            responseContent.simple = isSimple;
            const responseMessage = {
              id: asUUID(v4_default()),
              entityId: runtime.agentId,
              agentId: runtime.agentId,
              content: responseContent,
              roomId: message.roomId,
              createdAt: Date.now()
            };
            responseMessages = [responseMessage];
          }
          agentResponses.delete(message.roomId);
          if (agentResponses.size === 0) {
            latestResponseIds.delete(runtime.agentId);
          }
          if (responseContent?.providers?.length && responseContent?.providers?.length > 0) {
            state = await runtime.composeState(message, responseContent?.providers || []);
          }
          if (responseContent && responseContent.simple && responseContent.text) {
            if (responseContent.providers && responseContent.providers.length > 0) {
              logger18.debug("[Bootstrap] Simple response used providers", responseContent.providers);
            }
            await callback(responseContent);
          } else {
            await runtime.processActions(message, responseMessages, state, callback);
          }
          await runtime.evaluate(message, state, shouldRespond, callback, responseMessages);
        } else {
          logger18.debug("[Bootstrap] Agent decided not to respond (shouldRespond is false).");
          const currentResponseId = agentResponses.get(message.roomId);
          if (currentResponseId !== responseId) {
            logger18.info(
              `Ignore response discarded - newer message being processed for agent: ${runtime.agentId}, room: ${message.roomId}`
            );
            return;
          }
          if (!message.id) {
            logger18.error("[Bootstrap] Message ID is missing, cannot create ignore response.");
            return;
          }
          const ignoreContent = {
            thought: "Agent decided not to respond to this message.",
            actions: ["IGNORE"],
            simple: true,
            // Treat it as simple for callback purposes
            inReplyTo: createUniqueUuid3(runtime, message.id)
            // Reference original message
          };
          await callback(ignoreContent);
          const ignoreMemory = {
            id: asUUID(v4_default()),
            entityId: runtime.agentId,
            agentId: runtime.agentId,
            content: ignoreContent,
            roomId: message.roomId,
            createdAt: Date.now()
          };
          await runtime.createMemory(ignoreMemory, "messages");
          logger18.debug("[Bootstrap] Saved ignore response to memory", {
            memoryId: ignoreMemory.id
          });
          agentResponses.delete(message.roomId);
          if (agentResponses.size === 0) {
            latestResponseIds.delete(runtime.agentId);
          }
        }
        await runtime.emitEvent(EventType.RUN_ENDED, {
          runtime,
          runId,
          messageId: message.id,
          roomId: message.roomId,
          entityId: message.entityId,
          startTime,
          status: "completed",
          endTime: Date.now(),
          duration: Date.now() - startTime,
          source: "messageHandler"
        });
      } catch (error) {
        console.error("error is", error);
        await runtime.emitEvent(EventType.RUN_ENDED, {
          runtime,
          runId,
          messageId: message.id,
          roomId: message.roomId,
          entityId: message.entityId,
          startTime,
          status: "error",
          endTime: Date.now(),
          duration: Date.now() - startTime,
          error: error.message,
          source: "messageHandler"
        });
      }
    })();
    await Promise.race([processingPromise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutId);
    onComplete?.();
  }
};
var reactionReceivedHandler = async ({
  runtime,
  message
}) => {
  try {
    await runtime.createMemory(message, "messages");
  } catch (error) {
    if (error.code === "23505") {
      logger18.warn("[Bootstrap] Duplicate reaction memory, skipping");
      return;
    }
    logger18.error("[Bootstrap] Error in reaction handler:", error);
  }
};
var messageDeletedHandler = async ({
  runtime,
  message
}) => {
  try {
    if (!message.id) {
      logger18.error("[Bootstrap] Cannot delete memory: message ID is missing");
      return;
    }
    logger18.info("[Bootstrap] Deleting memory for message", message.id, "from room", message.roomId);
    await runtime.deleteMemory(message.id);
    logger18.debug("[Bootstrap] Successfully deleted memory for message", message.id);
  } catch (error) {
    logger18.error("[Bootstrap] Error in message deleted handler:", error);
  }
};
var channelClearedHandler = async ({
  runtime,
  roomId,
  channelId,
  memoryCount
}) => {
  try {
    logger18.info(
      `[Bootstrap] Clearing ${memoryCount} message memories from channel ${channelId} -> room ${roomId}`
    );
    const memories = await runtime.getMemoriesByRoomIds({
      tableName: "messages",
      roomIds: [roomId]
    });
    let deletedCount = 0;
    for (const memory of memories) {
      if (memory.id) {
        try {
          await runtime.deleteMemory(memory.id);
          deletedCount++;
        } catch (error) {
          logger18.warn(`[Bootstrap] Failed to delete message memory ${memory.id}:`, error);
        }
      }
    }
    logger18.info(
      `[Bootstrap] Successfully cleared ${deletedCount}/${memories.length} message memories from channel ${channelId}`
    );
  } catch (error) {
    logger18.error("[Bootstrap] Error in channel cleared handler:", error);
  }
};
var postGeneratedHandler = async ({
  runtime,
  callback,
  worldId,
  userId,
  roomId,
  source
}) => {
  logger18.info("[Bootstrap] Generating new post...");
  await runtime.ensureWorldExists({
    id: worldId,
    name: `${runtime.character.name}'s Feed`,
    agentId: runtime.agentId,
    serverId: userId
  });
  await runtime.ensureRoomExists({
    id: roomId,
    name: `${runtime.character.name}'s Feed`,
    source,
    type: ChannelType9.FEED,
    channelId: `${userId}-home`,
    serverId: userId,
    worldId
  });
  const message = {
    id: createUniqueUuid3(runtime, `tweet-${Date.now()}`),
    entityId: runtime.agentId,
    agentId: runtime.agentId,
    roomId,
    content: {},
    metadata: {
      entityName: runtime.character.name,
      type: "message"
    }
  };
  let state = await runtime.composeState(message, [
    "PROVIDERS",
    "CHARACTER",
    "RECENT_MESSAGES",
    "ENTITIES"
  ]);
  const entity = await runtime.getEntityById(runtime.agentId);
  if (entity?.metadata?.twitter?.userName || entity?.metadata?.userName) {
    state.values.twitterUserName = entity?.metadata?.twitter?.userName || entity?.metadata?.userName;
  }
  const prompt = composePromptFromState9({
    state,
    template: runtime.character.templates?.messageHandlerTemplate || messageHandlerTemplate
  });
  let responseContent = null;
  let retries = 0;
  const maxRetries = 3;
  while (retries < maxRetries && (!responseContent?.thought || !responseContent?.actions)) {
    const response = await runtime.useModel(ModelType13.TEXT_SMALL, {
      prompt
    });
    console.log("prompt is", prompt);
    console.log("response is", response);
    const parsedXml = parseKeyValueXml(response);
    if (parsedXml) {
      responseContent = {
        thought: parsedXml.thought || "",
        actions: parsedXml.actions || ["IGNORE"],
        providers: parsedXml.providers || [],
        text: parsedXml.text || "",
        simple: parsedXml.simple || false
      };
    } else {
      responseContent = null;
    }
    retries++;
    if (!responseContent?.thought || !responseContent?.actions) {
      logger18.warn(
        "[Bootstrap] *** Missing required fields, retrying... ***\n",
        response,
        parsedXml,
        responseContent
      );
    }
  }
  state = await runtime.composeState(message, responseContent?.providers);
  const postPrompt = composePromptFromState9({
    state,
    template: runtime.character.templates?.postCreationTemplate || postCreationTemplate
  });
  const xmlResponseText = await runtime.useModel(ModelType13.TEXT_LARGE, {
    prompt: postPrompt
  });
  const parsedXmlResponse = parseKeyValueXml(xmlResponseText);
  if (!parsedXmlResponse) {
    logger18.error(
      "[Bootstrap] Failed to parse XML response for post creation. Raw response:",
      xmlResponseText
    );
    return;
  }
  function cleanupPostText(text) {
    let cleanedText2 = text.replace(/^['"](.*)['"]$/, "$1");
    cleanedText2 = cleanedText2.replaceAll(/\\n/g, "\n\n");
    cleanedText2 = cleanedText2.replace(/([^\n])\n([^\n])/g, "$1\n\n$2");
    return cleanedText2;
  }
  const cleanedText = cleanupPostText(parsedXmlResponse.post || "");
  const RM = state.providerData?.find((pd) => pd.providerName === "RECENT_MESSAGES");
  if (RM) {
    for (const m of RM.data.recentMessages) {
      if (cleanedText === m.content.text) {
        logger18.log("[Bootstrap] Already recently posted that, retrying", cleanedText);
        postGeneratedHandler({
          runtime,
          callback,
          worldId,
          userId,
          roomId,
          source
        });
        return;
      }
    }
  }
  const oaiRefusalRegex = /((i\s+do\s+not|i'm\s+not)\s+(feel\s+)?comfortable\s+generating\s+that\s+type\s+of\s+content)|(inappropriate|explicit|respectful|offensive|guidelines|aim\s+to\s+(be\s+)?helpful|communicate\s+respectfully)/i;
  const anthropicRefusalRegex = /(i'?m\s+unable\s+to\s+help\s+with\s+that\s+request|due\s+to\s+safety\s+concerns|that\s+may\s+violate\s+(our\s+)?guidelines|provide\s+helpful\s+and\s+safe\s+responses|let'?s\s+try\s+a\s+different\s+direction|goes\s+against\s+(our\s+)?use\s+case\s+policies|ensure\s+safe\s+and\s+responsible\s+use)/i;
  const googleRefusalRegex = /(i\s+can'?t\s+help\s+with\s+that|that\s+goes\s+against\s+(our\s+)?(policy|policies)|i'?m\s+still\s+learning|response\s+must\s+follow\s+(usage|safety)\s+policies|i'?ve\s+been\s+designed\s+to\s+avoid\s+that)/i;
  const generalRefusalRegex = /(response\s+was\s+withheld|content\s+was\s+filtered|this\s+request\s+cannot\s+be\s+completed|violates\s+our\s+safety\s+policy|content\s+is\s+not\s+available)/i;
  if (oaiRefusalRegex.test(cleanedText) || anthropicRefusalRegex.test(cleanedText) || googleRefusalRegex.test(cleanedText) || generalRefusalRegex.test(cleanedText)) {
    logger18.log("[Bootstrap] Got prompt moderation refusal, retrying", cleanedText);
    postGeneratedHandler({
      runtime,
      callback,
      worldId,
      userId,
      roomId,
      source
    });
    return;
  }
  const responseMessages = [
    {
      id: v4_default(),
      entityId: runtime.agentId,
      agentId: runtime.agentId,
      content: {
        text: cleanedText,
        source,
        channelType: ChannelType9.FEED,
        thought: parsedXmlResponse.thought || "",
        type: "post"
      },
      roomId: message.roomId,
      createdAt: Date.now()
    }
  ];
  for (const message2 of responseMessages) {
    await callback?.(message2.content);
  }
};
var syncSingleUser = async (entityId, runtime, serverId, channelId, type, source) => {
  try {
    const entity = await runtime.getEntityById(entityId);
    logger18.info(`[Bootstrap] Syncing user: ${entity?.metadata?.username || entityId}`);
    if (!channelId) {
      logger18.warn(`[Bootstrap] Cannot sync user ${entity?.id} without a valid channelId`);
      return;
    }
    const roomId = createUniqueUuid3(runtime, channelId);
    const worldId = createUniqueUuid3(runtime, serverId);
    const worldMetadata = type === ChannelType9.DM ? {
      ownership: {
        ownerId: entityId
      },
      roles: {
        [entityId]: Role2.OWNER
      },
      settings: {}
      // Initialize empty settings for onboarding
    } : void 0;
    logger18.info(
      `[Bootstrap] syncSingleUser - type: ${type}, isDM: ${type === ChannelType9.DM}, worldMetadata: ${JSON.stringify(worldMetadata)}`
    );
    await runtime.ensureConnection({
      entityId,
      roomId,
      name: entity?.metadata?.name || entity?.metadata?.username || `User${entityId}`,
      source,
      channelId,
      serverId,
      type,
      worldId,
      metadata: worldMetadata
    });
    try {
      const createdWorld = await runtime.getWorld(worldId);
      logger18.info(
        `[Bootstrap] Created world check - ID: ${worldId}, metadata: ${JSON.stringify(createdWorld?.metadata)}`
      );
    } catch (error) {
      logger18.error(`[Bootstrap] Failed to verify created world: ${error}`);
    }
    logger18.success(`[Bootstrap] Successfully synced user: ${entity?.id}`);
  } catch (error) {
    logger18.error(
      `[Bootstrap] Error syncing user: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
var handleServerSync = async ({
  runtime,
  world,
  rooms,
  entities,
  source,
  onComplete
}) => {
  logger18.debug(`[Bootstrap] Handling server sync event for server: ${world.name}`);
  try {
    await runtime.ensureConnections(entities, rooms, source, world);
    logger18.debug(`Successfully synced standardized world structure for ${world.name}`);
    onComplete?.();
  } catch (error) {
    logger18.error(
      `Error processing standardized server data: ${error instanceof Error ? error.message : String(error)}`
    );
  }
};
var controlMessageHandler = async ({
  runtime,
  message
}) => {
  try {
    logger18.debug(
      `[controlMessageHandler] Processing control message: ${message.payload.action} for room ${message.roomId}`
    );
    const serviceNames = Array.from(runtime.getAllServices().keys());
    const websocketServiceName = serviceNames.find(
      (name) => name.toLowerCase().includes("websocket") || name.toLowerCase().includes("socket")
    );
    if (websocketServiceName) {
      const websocketService = runtime.getService(websocketServiceName);
      if (websocketService && "sendMessage" in websocketService) {
        await websocketService.sendMessage({
          type: "controlMessage",
          payload: {
            action: message.payload.action,
            target: message.payload.target,
            roomId: message.roomId
          }
        });
        logger18.debug(
          `[controlMessageHandler] Control message ${message.payload.action} sent successfully`
        );
      } else {
        logger18.error("[controlMessageHandler] WebSocket service does not have sendMessage method");
      }
    } else {
      logger18.error("[controlMessageHandler] No WebSocket service found to send control message");
    }
  } catch (error) {
    logger18.error(`[controlMessageHandler] Error processing control message: ${error}`);
  }
};
var events = {
  [EventType.MESSAGE_RECEIVED]: [
    async (payload) => {
      if (!payload.callback) {
        logger18.error("No callback provided for message");
        return;
      }
      await messageReceivedHandler({
        runtime: payload.runtime,
        message: payload.message,
        callback: payload.callback,
        onComplete: payload.onComplete
      });
    }
  ],
  [EventType.VOICE_MESSAGE_RECEIVED]: [
    async (payload) => {
      if (!payload.callback) {
        logger18.error("No callback provided for voice message");
        return;
      }
      await messageReceivedHandler({
        runtime: payload.runtime,
        message: payload.message,
        callback: payload.callback,
        onComplete: payload.onComplete
      });
    }
  ],
  [EventType.REACTION_RECEIVED]: [
    async (payload) => {
      await reactionReceivedHandler({
        runtime: payload.runtime,
        message: payload.message
      });
    }
  ],
  [EventType.POST_GENERATED]: [
    async (payload) => {
      await postGeneratedHandler(payload);
    }
  ],
  [EventType.MESSAGE_SENT]: [
    async (payload) => {
      logger18.debug(`[Bootstrap] Message sent: ${payload.message.content.text}`);
    }
  ],
  [EventType.MESSAGE_DELETED]: [
    async (payload) => {
      await messageDeletedHandler({
        runtime: payload.runtime,
        message: payload.message
      });
    }
  ],
  [EventType.CHANNEL_CLEARED]: [
    async (payload) => {
      await channelClearedHandler({
        runtime: payload.runtime,
        roomId: payload.roomId,
        channelId: payload.channelId,
        memoryCount: payload.memoryCount
      });
    }
  ],
  [EventType.WORLD_JOINED]: [
    async (payload) => {
      await handleServerSync(payload);
    }
  ],
  [EventType.WORLD_CONNECTED]: [
    async (payload) => {
      await handleServerSync(payload);
    }
  ],
  [EventType.ENTITY_JOINED]: [
    async (payload) => {
      logger18.debug(`[Bootstrap] ENTITY_JOINED event received for entity ${payload.entityId}`);
      if (!payload.worldId) {
        logger18.error("[Bootstrap] No worldId provided for entity joined");
        return;
      }
      if (!payload.roomId) {
        logger18.error("[Bootstrap] No roomId provided for entity joined");
        return;
      }
      if (!payload.metadata?.type) {
        logger18.error("[Bootstrap] No type provided for entity joined");
        return;
      }
      await syncSingleUser(
        payload.entityId,
        payload.runtime,
        payload.worldId,
        payload.roomId,
        payload.metadata.type,
        payload.source
      );
    }
  ],
  [EventType.ENTITY_LEFT]: [
    async (payload) => {
      try {
        const entity = await payload.runtime.getEntityById(payload.entityId);
        if (entity) {
          entity.metadata = {
            ...entity.metadata,
            status: "INACTIVE",
            leftAt: Date.now()
          };
          await payload.runtime.updateEntity(entity);
        }
        logger18.info(`[Bootstrap] User ${payload.entityId} left world ${payload.worldId}`);
      } catch (error) {
        logger18.error(`[Bootstrap] Error handling user left: ${error.message}`);
      }
    }
  ],
  [EventType.ACTION_STARTED]: [
    async (payload) => {
      logger18.debug(`[Bootstrap] Action started: ${payload.actionName} (${payload.actionId})`);
    }
  ],
  [EventType.ACTION_COMPLETED]: [
    async (payload) => {
      const status = payload.error ? `failed: ${payload.error.message}` : "completed";
      logger18.debug(`[Bootstrap] Action ${status}: ${payload.actionName} (${payload.actionId})`);
    }
  ],
  [EventType.EVALUATOR_STARTED]: [
    async (payload) => {
      logger18.debug(
        `[Bootstrap] Evaluator started: ${payload.evaluatorName} (${payload.evaluatorId})`
      );
    }
  ],
  [EventType.EVALUATOR_COMPLETED]: [
    async (payload) => {
      const status = payload.error ? `failed: ${payload.error.message}` : "completed";
      logger18.debug(
        `[Bootstrap] Evaluator ${status}: ${payload.evaluatorName} (${payload.evaluatorId})`
      );
    }
  ],
  CONTROL_MESSAGE: [controlMessageHandler]
};
var bootstrapPlugin = {
  name: "bootstrap",
  description: "Agent bootstrap with basic actions and evaluators",
  actions: [
    replyAction,
    followRoomAction,
    unfollowRoomAction,
    ignoreAction,
    noneAction,
    muteRoomAction,
    unmuteRoomAction,
    sendMessageAction,
    updateEntityAction,
    choiceAction,
    updateRoleAction,
    updateSettingsAction
  ],
  // this is jank, these events are not valid
  events,
  evaluators: [reflectionEvaluator],
  providers: [
    evaluatorsProvider,
    anxietyProvider,
    timeProvider,
    entitiesProvider,
    relationshipsProvider,
    choiceProvider,
    factsProvider,
    roleProvider,
    settingsProvider,
    capabilitiesProvider,
    attachmentsProvider,
    providersProvider,
    actionsProvider,
    characterProvider,
    recentMessagesProvider,
    worldProvider
  ],
  services: [TaskService]
};
var index_default = bootstrapPlugin;
export {
  actionsProvider,
  anxietyProvider,
  attachmentsProvider,
  bootstrapPlugin,
  capabilitiesProvider,
  characterProvider,
  choiceAction,
  choiceProvider,
  index_default as default,
  entitiesProvider,
  evaluatorsProvider,
  factsProvider,
  fetchMediaData,
  followRoomAction,
  ignoreAction,
  muteRoomAction,
  noneAction,
  processAttachments,
  providersProvider,
  recentMessagesProvider,
  reflectionEvaluator,
  relationshipsProvider,
  replyAction,
  roleProvider,
  sendMessageAction,
  settingsProvider,
  shouldBypassShouldRespond,
  timeProvider,
  unfollowRoomAction,
  unmuteRoomAction,
  updateEntityAction,
  updateRoleAction,
  updateSettingsAction,
  worldProvider
};
//# sourceMappingURL=index.js.map