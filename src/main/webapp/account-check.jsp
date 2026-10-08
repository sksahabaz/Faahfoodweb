<%
    String errorMessage =
            (String) request.getAttribute("errorMessage");

    String email =
            (String) request.getAttribute("email");

    if (email == null) {
        email = "";
    }

    Boolean newUser =
            (Boolean) request.getAttribute("newUser");
%>

<!DOCTYPE html>
<html>

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Continue - FAah!! FOOD</title>

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

        .container {
            width: 100%;
            max-width: 430px;

            background: white;

            padding: 35px;

            border-radius: 16px;

            box-shadow:
                0 10px 30px rgba(0, 0, 0, 0.08);
        }

        .logo {
            text-align: center;

            font-size: 28px;

            font-weight: 800;

            color: #1677ff;

            margin-bottom: 10px;
        }

        .title {
            text-align: center;

            font-size: 22px;

            margin-bottom: 8px;

            color: #222;
        }

        .subtitle {
            text-align: center;

            color: #666;

            margin-bottom: 28px;

            font-size: 14px;

            line-height: 1.5;
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

        .continue-btn {
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

        .continue-btn:hover {
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

        .new-user {
            margin-top: 20px;

            padding: 15px;

            background: #f5f9ff;

            border-radius: 10px;

            text-align: center;
        }

        .new-user p {
            color: #555;

            font-size: 14px;

            margin-bottom: 10px;
        }

        .signup-btn {
            display: inline-block;

            padding: 10px 18px;

            background: white;

            color: #1677ff;

            border: 1px solid #1677ff;

            border-radius: 7px;

            text-decoration: none;

            font-weight: 600;

            font-size: 14px;
        }

        .signup-btn:hover {
            background: #1677ff;

            color: white;
        }

    </style>

</head>

<body>

<div class="container">

    <div class="logo">
        FAah!! FOOD
    </div>

    <h2 class="title">
        Continue to Checkout
    </h2>

    <p class="subtitle">
        Enter your email address to continue.
    </p>


    <% if (errorMessage != null) { %>

        <div class="error">
            <%= errorMessage %>
        </div>

    <% } %>


    <form action="<%=request.getContextPath()%>/account-check"
          method="post">

        <div class="form-group">

            <label for="email">
                Email Address
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


        <button
            type="submit"
            class="continue-btn">

            Continue

        </button>

    </form>


    <% if (Boolean.TRUE.equals(newUser)) { %>

        <div class="new-user">

            <p>
                No account found with this email.
            </p>

            <a
                href="<%=request.getContextPath()%>/signup.jsp"
                class="signup-btn">

                Create an Account

            </a>

        </div>

    <% } %>

</div>

</body>

</html>