"use client";
import React, { useEffect, useState } from "react";
import type { FormProps } from "antd";
import { Button, Checkbox, Form, Input, message } from "antd";
import { useRouter } from "next/navigation";

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
};

export default function Login() {
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const router = useRouter();
  useEffect(() => {
    let uname = localStorage.getItem("username") || "";
    let pwd = localStorage.getItem("password") || "";
    let obj = { remember: true, password: pwd, username: uname };
    form.setFieldsValue(obj);
  }, []);
  const onFinish = (values: any) => {
    const { remember, password, username } = values;
    fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })
      .then(async (res) => {
        if (res.status === 200) {
          localStorage.setItem("token", username);
          if (remember) {
            localStorage.setItem("username", username);
            localStorage.setItem("password", password);
          } else {
            localStorage.removeItem("username");
            localStorage.removeItem("password");
          }
          router.push("/");
          return true;
        } else {
          let data = await res.json();
          messageApi.error(data.detail);
          return false;
        }
      })
      .then((response) => {
        if (response) {
        }
      });
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <div className="w-[90%] lg:w-[30%] mx-auto mt-[10%] pt-14 pb-4 px-4 rounded-xl shadow-[0_3px_16px_1px_#ccc]">
      {contextHolder}
      <div className="text-center text-3xl font-semibold mb-12">立即登录</div>
      <Form
        form={form}
        name="basic"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        style={{ maxWidth: 600 }}
        onFinish={(e) => onFinish(e)}
        onFinishFailed={(e) => onFinishFailed(e)}
        autoComplete="off"
      >
        <Form.Item<FieldType>
          label="用户名"
          name="username"
          rules={[{ required: true, message: "请输入账号!" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item<FieldType>
          label="密码"
          name="password"
          rules={[{ required: true, message: "请输入密码!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item<FieldType>
          name="remember"
          valuePropName="checked"
          label={null}
        >
          <Checkbox>记住账号</Checkbox>
        </Form.Item>

        <Form.Item label={null}>
          <Button type="primary" htmlType="submit">
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
