import React, { useState } from 'react'
import { Input } from 'antd'
import { EditOutlined } from '@ant-design/icons'

export interface EditableValueProps {
  defaultValue: string
  editing?: boolean
  onChange?: (newName: string) => void
  onEditStart?: () => void
  onEditCancel?: () => void
}

/**
 * Value that can be edited on double click.
 * Similar to AntD's Typography with editable=true
 *
 * @param props
 * @constructor
 */
const EditableValue: React.FC<EditableValueProps> = props => {
  const { defaultValue, editing, onEditCancel, onEditStart, onChange } = props
  const [showEditIcon, setShowEditIcon] = useState<boolean>(false)

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // select all on focus
    e.target.select()
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onEditCancel?.()
      setShowEditIcon(false)
    } else if (e.key === 'Enter') {
      onChange?.(e.currentTarget.value)
      setShowEditIcon(false)
    }
  }

  if (editing) {
    return (
      <Input
        size="small"
        defaultValue={defaultValue}
        autoFocus
        onFocus={onFocus}
        onKeyDown={onKeyDown}
      />
    )
  }

  const onMouseOver = () => setShowEditIcon(true)
  const onMouseLeave = () => setShowEditIcon(false)

  return (
    <span onMouseOver={onMouseOver} onMouseLeave={onMouseLeave}>
      {defaultValue}{' '}
      <EditOutlined
        onClick={() => onEditStart?.()}
        style={{ opacity: `${showEditIcon ? '1' : '0'}` }}
      />
    </span>
  )
}

export default EditableValue
