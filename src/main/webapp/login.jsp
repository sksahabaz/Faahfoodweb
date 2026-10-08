<%@ page import="com.food.model.User" %>

<%
    String errorMessage =
            (String) request.getAttribute("errorMessage");

    String email =
            (String) request.getAttribute("email");

    if (email == null) {
        email = "";
    }
%>

<!DOCTYPE html>
<html>
<head>

    <meta charset="UTF-8">

    <title>Login - FAah!! FOOD</title>

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <style>

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: Arial, sans-serif;
            background: #f7f8fa;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .login-container {
            width: 100%;
            max-width: 420px;
            background: white;
            padding: 35px;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        .logo {
            text-align: center;
            margin-bottom: 10px;
            font-size: 28px;
            font-weight: 800;
            color: #1677ff;
        }

        .subtitle {
            text-align: center;
            color: #666;
            margin-bottom: 30px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
        }

        input {
            width: 100%;
            padding: 13px 14px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 15px;
            outline: none;
        }

        input:focus {
            border-color: #1677ff;
        }

        .login-btn {
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 8px;
            background: #1677ff;
            color: white;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
        }

        .login-btn:hover {
            background: #0868e8;
        }

        .error {
            background: #fff1f1;
            color: #d93025;
            padding: 12px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
        }

        .signup-text {
            text-align: center;
            margin-top: 22px;
            color: #666;
            font-size: 14px;
        }

        .signup-text a {
            color: #1677ff;
            text-decoration: none;
            font-weight: 600;
        }

    </style>

</head>

<body>

<div class="login-container">

    <div class="logo">
        FAah!! FOOD
    </div>

    <p class="subtitle">
        Login to continue
    </p>


    <% if (errorMessage != null) { %>

        <div class="error">
            <%= errorMessage %>
        </div>

    <% } %>


    <form action="<%=request.getContextPath()%>/login"
          method="post">

        <div class="form-group">

            <label for="email">
                Email
            </label>

            <input
                type="email"
                id="email"
                name="email"
                value="<%=email%>"
                placeholder="Enter your email"
                required
            >

        </div>


        <div class="form-group">

            <label for="password">
                Password
            </label>

            <input
                type="password"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
            >

        </div>


        <button
            type="submit"
            class="login-btn">

            Login

        </button>

    </form>


    <div class="signup-text">

        Don't have an account?

        <a href="<%=request.getContextPath()%>/signup.jsp">
            Sign Up
        </a>

    </div>

</div>

</body>
</html>