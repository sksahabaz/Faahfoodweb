<%
    String errorMessage =
            (String) request.getAttribute("errorMessage");

    String email =
            (String) request.getAttribute("email");

    String name =
            (String) request.getAttribute("name");

    String phone =
            (String) request.getAttribute("phone");

    String address =
            (String) request.getAttribute("address");

    if (email == null) email = "";
    if (name == null) name = "";
    if (phone == null) phone = "";
    if (address == null) address = "";
%>

<!DOCTYPE html>
<html>

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>Create Account - FAah!! FOOD</title>

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

            padding: 30px;
        }

        .signup-container {
            width: 100%;
            max-width: 480px;

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

            margin-bottom: 8px;
        }

        .title {
            text-align: center;

            font-size: 22px;

            color: #222;

            margin-bottom: 8px;
        }

        .subtitle {
            text-align: center;

            color: #666;

            font-size: 14px;

            margin-bottom: 28px;
        }

        .form-group {
            margin-bottom: 18px;
        }

        label {
            display: block;

            margin-bottom: 7px;

            font-weight: 600;

            color: #333;
        }

        input,
        textarea {
            width: 100%;

            padding: 13px 14px;

            border: 1px solid #ddd;

            border-radius: 8px;

            font-size: 15px;

            outline: none;
        }

        input:focus,
        textarea:focus {
            border-color: #1677ff;
        }

        textarea {
            resize: vertical;

            min-height: 90px;
        }

        .signup-btn {
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

        .signup-btn:hover {
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

        .login-text {
            text-align: center;

            margin-top: 20px;

            color: #666;

            font-size: 14px;
        }

        .login-text a {
            color: #1677ff;

            text-decoration: none;

            font-weight: 600;
        }

    </style>

</head>

<body>

<div class="signup-container">

    <div class="logo">
        FAah!! FOOD
    </div>

    <h2 class="title">
        Create Your Account
    </h2>

    <p class="subtitle">
        Register to continue ordering delicious food.
    </p>


    <% if (errorMessage != null) { %>

        <div class="error">
            <%= errorMessage %>
        </div>

    <% } %>


    <form action="<%=request.getContextPath()%>/signup"
          method="post">


        <!-- NAME -->

        <div class="form-group">

            <label for="name">
                Full Name
            </label>

            <input
                type="text"
                id="name"
                name="name"
                value="<%=name%>"
                placeholder="Enter your full name"
                required
            >

        </div>


        <!-- EMAIL -->

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


        <!-- PASSWORD -->

        <div class="form-group">

            <label for="password">
                Password
            </label>

            <input
                type="password"
                id="password"
                name="password"
                placeholder="Create a password"
                required
            >

        </div>


        <!-- PHONE -->


<div class="form-group">

    <label for="phone">
        Phone Number
    </label>

    <input
        type="tel"
        id="phone"
        name="phone"
        value="<%=phone%>"
        placeholder="Enter your phone number"
        required
    >

</div>

<!-- ADDRESS -->

<div class="form-group">

    <label for="address">
        Address
    </label>

    <textarea
        id="address"
        name="address"
        placeholder="Enter your complete address"
        required
    ><%=address%></textarea>

</div>




        <button
            type="submit"
            class="signup-btn">

            Create Account

        </button>

    </form>


    <div class="login-text">

        Already have an account?

        <a href="<%=request.getContextPath()%>/login">
            Login
        </a>

    </div>

</div>

</body>

</html>