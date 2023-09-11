// notification
type NotificationType = {
  text: string
  icon?: string
  name: string
  onClick?: () => void
}

const notification = ({ name, text, icon, onClick }: NotificationType) => {
  const notification = new Notification(`MallChat: ${name}`, {
    body: text,
    icon: icon,
  })

  notification.addEventListener('click', () => {
    onClick?.()
  })
}

const notify = ({ name, text, icon, onClick }: NotificationType) => {
  switch (Notification.permission) {
    case 'granted': {
      notification({ name, text, icon, onClick })
      break
    }
    case 'default': {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          notification({ name, text, icon, onClick })
        }
      })
    }
  }
}

export default notify
