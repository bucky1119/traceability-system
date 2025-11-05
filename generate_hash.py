import bcrypt
import getpass

def generate_hash():
    """
    获取用户输入的密码并生成 bcrypt 哈希值。
    """
    try:
        # 使用 getpass 安全地输入密码，避免在屏幕上显示
        password = getpass.getpass("请输入您要加密的密码: ")
        
        if not password:
            print("错误：密码不能为空。")
            return

        # 将密码编码为 UTF-8 字节
        password_bytes = password.encode('utf-8')

        # 生成盐 (salt)
        salt = bcrypt.gensalt()

        # 使用盐生成密码的哈希值
        hashed_password = bcrypt.hashpw(password_bytes, salt)

        # 将哈希值解码为字符串以便显示和复制
        hashed_password_str = hashed_password.decode('utf-8')

        print("\n" + "="*30)
        print(f"原始密码: {'*' * len(password)}")
        print(f"生成的 Bcrypt 哈希: {hashed_password_str}")
        print("="*30)
        print("\n请将上面生成的哈希值用于您的 SQL 语句。")

    except Exception as e:
        print(f"生成哈希时出错: {e}")

if __name__ == "__main__":
    generate_hash()
