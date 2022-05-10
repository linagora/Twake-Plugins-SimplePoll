export type HookEvent = {
  type: "action" | "interactive_message_action" | "hook";
  name?: any;
  connection_id?: string;
  user_id?: string;
  title?: string;
  icon?: string;
  company_id?: string;
  workspace_id?: string;
  content: {
    command?: string;
    channel?: any;
    thread?: any;
    message?: any;
    form?: any;
    user?: {
      preferences: {
        locale: string;
      };
      first_name: string;
      last_name: string;
      id: string;
    };
  };
};

export type PollOptions = {
  language: string;
  options: [
    {
      name: string;
      votes: { number: number; users: string[] };
    }
  ];
};
