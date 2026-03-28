import { useState, useEffect, useCallback, useRef } from "react";
import Mailjs from "@cemalgnlts/mailjs";
import type { TempMailMessage, MailEvent } from "@/app/types";

const API_PROXY_URL = process.env.NEXT_PUBLIC_MAIL_PROXY_URL;

// mail.tm 官方 API 地址（作为降级方案）
const MAIL_TM_API = "https://api.mail.tm";

interface UseMailReturn {
  tempEmail: string;
  emailLoading: boolean;
  emailError: string | null;
  messages: TempMailMessage[];
  selectedMessage: TempMailMessage | null;
  toastMessage: TempMailMessage | null;
  setSelectedMessage: (message: TempMailMessage | null) => void;
  setToastMessage: (message: TempMailMessage | null) => void;
  handleMessageClick: (msg: TempMailMessage) => Promise<void>;
  refreshEmail: () => Promise<void>;
}

function createMailClient(proxyUrl?: string): Mailjs {
  const mail = new Mailjs();

  // 使用 Object.defineProperty 设置 baseUrl
  // 这是必要的，因为 mailjs 库内部使用 baseUrl 来构建 API 请求
  const baseUrl = proxyUrl || MAIL_TM_API;
  Object.defineProperty(mail, "baseUrl", {
    value: baseUrl,
    writable: true,
    enumerable: true,
    configurable: true,
  });

  return mail;
}

export default function useMail(): UseMailReturn {
  const [tempEmail, setTempEmail] = useState<string>("");
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [messages, setMessages] = useState<TempMailMessage[]>([]);
  const mailjsRef = useRef<Mailjs | null>(null);
  const [selectedMessage, setSelectedMessage] =
    useState<TempMailMessage | null>(null);
  const [toastMessage, setToastMessage] = useState<TempMailMessage | null>(
    null
  );

  // 初始化 mailjs 客户端
  const getMailClient = useCallback(() => {
    if (!mailjsRef.current) {
      mailjsRef.current = createMailClient(API_PROXY_URL);
    }
    return mailjsRef.current;
  }, []);

  // 创建临时邮箱的核心逻辑
  const createTempEmail = useCallback(async () => {
    setEmailLoading(true);
    setEmailError(null);

    try {
      const mailjs = getMailClient();

      // 创建账户
      const account = await mailjs.createOneAccount();

      if (!account.status) {
        throw new Error(account.message || "创建邮箱账户失败");
      }

      const email = account.data.username;
      setTempEmail(email);

      // 登录
      const loginResult = await mailjs.login(
        account.data.username,
        account.data.password
      );

      if (!loginResult.status) {
        throw new Error(loginResult.message || "登录邮箱失败");
      }

      // 监听新邮件
      mailjs.on("arrive", async (message: MailEvent) => {
        try {
          const fullMessage = await mailjs.getMessage(message.id);
          if (fullMessage.status) {
            const source = await mailjs.getSource(message.id);
            const messageData = {
              ...fullMessage.data,
              source: {
                id: source.data?.id,
                data: source.data?.data,
                downloadUrl: source.data?.downloadUrl,
              },
            } as TempMailMessage;
            setMessages((prev) => [...prev, messageData]);
            setToastMessage(messageData);
          }
        } catch (err) {
          console.error("获取新邮件详情失败:", err);
        }
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "创建临时邮箱失败";
      console.error("创建临时邮箱失败:", error);
      setEmailError(errorMsg);
      setTempEmail("");
    } finally {
      setEmailLoading(false);
    }
  }, [getMailClient]);

  // 刷新邮箱（重新创建）
  const refreshEmail = useCallback(async () => {
    // 清理旧的邮件监听
    if (mailjsRef.current) {
      mailjsRef.current.off();
      mailjsRef.current = null;
    }
    setMessages([]);
    setSelectedMessage(null);
    setToastMessage(null);
    await createTempEmail();
  }, [createTempEmail]);

  // 初始化：创建临时邮箱
  useEffect(() => {
    if (!tempEmail) {
      createTempEmail();
    }

    return () => {
      // 组件卸载时清理监听
      if (mailjsRef.current) {
        mailjsRef.current.off();
      }
    };
  }, [createTempEmail, tempEmail]);

  const handleMessageClick = async (msg: TempMailMessage) => {
    if (!msg.source) {
      try {
        const mailjs = getMailClient();
        const fullMessage = await mailjs.getMessage(msg.id);
        if (fullMessage.status) {
          const source = await mailjs.getSource(msg.id);
          const messageData = {
            ...fullMessage.data,
            source: {
              id: source.data?.id,
              data: source.data?.data,
              downloadUrl: source.data?.downloadUrl,
            },
          } as TempMailMessage;
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? messageData : m))
          );
          setSelectedMessage(messageData);
        }
      } catch (error) {
        console.error("获取邮件内容失败:", error);
      }
    } else {
      setSelectedMessage(msg);
    }
  };

  return {
    tempEmail,
    emailLoading,
    emailError,
    messages,
    selectedMessage,
    toastMessage,
    setSelectedMessage,
    setToastMessage,
    handleMessageClick,
    refreshEmail,
  };
}
