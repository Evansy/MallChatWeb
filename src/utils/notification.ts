// notification
type NotificationType = {
  text: string
  icon: string
  name: string
}

const notification = ({ name, text, icon }: NotificationType) => {
  new Notification(`MallChat: ${name}`, {
    body: text,
    icon: icon,
  })
}

const notify = ({ name, text, icon }: NotificationType) => {
  switch (Notification.permission) {
    case 'granted': {
      notification({ name, text, icon })
      break
    }
    case 'default': {
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          notification({ name, text, icon })
        }
      })
    }
  }
}

export default notify
